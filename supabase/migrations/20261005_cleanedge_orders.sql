create table if not exists public.cleanedge_config (
  key text primary key,
  value text not null
);

create table if not exists public.cleanedge_orders (
  id uuid primary key,
  invoice_token text not null unique,
  customer_name text not null default '',
  customer_email text not null,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  yoco_checkout_id text unique,
  yoco_payment_id text,
  event_id text unique,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.cleanedge_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.cleanedge_orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create index if not exists cleanedge_orders_created_at_idx on public.cleanedge_orders(created_at desc);
create index if not exists cleanedge_order_items_product_id_idx on public.cleanedge_order_items(product_id);
create index if not exists cleanedge_order_items_order_id_idx on public.cleanedge_order_items(order_id);

alter table public.cleanedge_config enable row level security;
alter table public.cleanedge_orders enable row level security;
alter table public.cleanedge_order_items enable row level security;

create or replace function public.cleanedge_require_secret(p_server_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_secret text;
begin
  select value into stored_secret from public.cleanedge_config where key = 'order_api_secret';
  if stored_secret is null or p_server_secret is distinct from stored_secret then
    raise exception 'Unauthorized';
  end if;
end;
$$;

create or replace function public.cleanedge_order_json(p_order_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'invoice_token', o.invoice_token,
    'customer_name', o.customer_name,
    'customer_email', o.customer_email,
    'total_cents', o.total_cents,
    'status', o.status,
    'yoco_checkout_id', o.yoco_checkout_id,
    'yoco_payment_id', o.yoco_payment_id,
    'event_id', o.event_id,
    'email_sent_at', o.email_sent_at,
    'created_at', o.created_at,
    'paid_at', o.paid_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.product_id,
        'name', i.product_name,
        'quantity', i.quantity,
        'unitPriceCents', i.unit_price_cents,
        'lineTotalCents', i.line_total_cents
      ) order by i.id)
      from public.cleanedge_order_items i
      where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.cleanedge_orders o
  where o.id = p_order_id;
$$;

create or replace function public.cleanedge_create_order(
  p_order_id uuid,
  p_invoice_token text,
  p_customer_name text,
  p_customer_email text,
  p_items jsonb,
  p_total_cents integer,
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  perform public.cleanedge_require_secret(p_server_secret);

  insert into public.cleanedge_orders(id, invoice_token, customer_name, customer_email, total_cents)
  values (p_order_id, p_invoice_token, coalesce(p_customer_name, ''), lower(trim(p_customer_email)), p_total_cents);

  for item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.cleanedge_order_items(order_id, product_id, product_name, quantity, unit_price_cents, line_total_cents)
    values (
      p_order_id,
      item->>'id',
      item->>'name',
      (item->>'quantity')::integer,
      (item->>'unitPriceCents')::integer,
      (item->>'lineTotalCents')::integer
    );
  end loop;

  return public.cleanedge_order_json(p_order_id);
end;
$$;

create or replace function public.cleanedge_attach_checkout(
  p_order_id uuid,
  p_yoco_checkout_id text,
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.cleanedge_require_secret(p_server_secret);
  update public.cleanedge_orders
  set yoco_checkout_id = p_yoco_checkout_id
  where id = p_order_id;
  return public.cleanedge_order_json(p_order_id);
end;
$$;

create or replace function public.cleanedge_mark_paid(
  p_yoco_checkout_id text,
  p_yoco_payment_id text,
  p_event_id text,
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  order_id_value uuid;
begin
  perform public.cleanedge_require_secret(p_server_secret);

  select id into order_id_value
  from public.cleanedge_orders
  where yoco_checkout_id = p_yoco_checkout_id;

  if order_id_value is null then
    raise exception 'Order not found';
  end if;

  update public.cleanedge_orders
  set status = 'paid',
      yoco_payment_id = coalesce(p_yoco_payment_id, yoco_payment_id),
      event_id = coalesce(event_id, p_event_id),
      paid_at = coalesce(paid_at, now())
  where id = order_id_value;

  return public.cleanedge_order_json(order_id_value);
end;
$$;

create or replace function public.cleanedge_mark_failed(
  p_yoco_checkout_id text,
  p_event_id text,
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  order_id_value uuid;
begin
  perform public.cleanedge_require_secret(p_server_secret);

  select id into order_id_value
  from public.cleanedge_orders
  where yoco_checkout_id = p_yoco_checkout_id;

  if order_id_value is null then
    raise exception 'Order not found';
  end if;

  update public.cleanedge_orders
  set status = case when status = 'paid' then 'paid' else 'failed' end,
      event_id = coalesce(event_id, p_event_id)
  where id = order_id_value;

  return public.cleanedge_order_json(order_id_value);
end;
$$;

create or replace function public.cleanedge_mark_email_sent(
  p_order_id uuid,
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.cleanedge_require_secret(p_server_secret);
  update public.cleanedge_orders set email_sent_at = now() where id = p_order_id;
  return public.cleanedge_order_json(p_order_id);
end;
$$;

create or replace function public.cleanedge_get_invoice(
  p_order_id uuid,
  p_invoice_token text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.cleanedge_order_json(o.id)
  from public.cleanedge_orders o
  where o.id = p_order_id
    and o.invoice_token = p_invoice_token
    and o.status = 'paid';
$$;

create or replace function public.cleanedge_admin_orders(
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.cleanedge_require_secret(p_server_secret);
  return coalesce((
    select jsonb_agg(public.cleanedge_order_json(o.id) order by o.created_at desc)
    from public.cleanedge_orders o
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.cleanedge_create_order(uuid,text,text,text,jsonb,integer,text) to anon, authenticated;
grant execute on function public.cleanedge_attach_checkout(uuid,text,text) to anon, authenticated;
grant execute on function public.cleanedge_mark_paid(text,text,text,text) to anon, authenticated;
grant execute on function public.cleanedge_mark_failed(text,text,text) to anon, authenticated;
grant execute on function public.cleanedge_mark_email_sent(uuid,text) to anon, authenticated;
grant execute on function public.cleanedge_get_invoice(uuid,text) to anon, authenticated;
grant execute on function public.cleanedge_admin_orders(text) to anon, authenticated;
