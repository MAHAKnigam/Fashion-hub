(function () {
  const container = document.getElementById('adminOrdersContainer');

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function formatINR(paise) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2
    }).format(Number(paise || 0) / 100);
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' :
      date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function message(text, isError = false) {
    container.innerHTML = '<div class="admin-orders-message' +
      (isError ? ' admin-orders-error' : '') + '">' + escapeHTML(text) + '</div>';
  }

  function nextStatus(status) {
    return ({ paid: 'processing', processing: 'shipped', shipped: 'delivered' })[status] || null;
  }

  function renderOrders(orders) {
    if (!orders.length) {
      message('No customer orders have been placed yet.');
      return;
    }

    container.innerHTML = orders.map(order => {
      const address = order.shipping_address || {};
      const items = Array.isArray(order.order_items) ? order.order_items : [];
      const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;
      const next = order.inventory_issue ? null : nextStatus(order.status);
      const inventoryWarning = order.inventory_issue
        ? '<p class="admin-inventory-warning"><strong>Inventory review required:</strong> Payment was captured, but stock could not be re-reserved. Check availability and resolve the issue before fulfilment.</p>'
        : '';
      const itemText = items.length
        ? items.map(item => escapeHTML(item.product_name) + ' × ' + Number(item.quantity)).join('<br>')
        : 'No item details';
      const customer = address.recipient_name || 'Customer';
      const destination = [address.address_line1, address.address_line2, address.city, address.state, address.postal_code]
        .filter(Boolean).join(', ');
      const action = next
        ? '<button type="button" data-order-id="' + escapeHTML(order.id) + '" data-next-status="' + next + '">Mark as ' + next.replaceAll('_', ' ') + '</button>'
        : '<span class="admin-order-muted">' + (order.inventory_issue ? 'Resolve inventory review before fulfilment' : 'No further status action') + '</span>';

      return `
        <article class="admin-order-card">
          <div class="admin-order-top">
            <div>
              <div class="admin-order-id">Order #${escapeHTML(order.id)}</div>
              <div class="admin-order-meta">Placed ${escapeHTML(formatDate(order.created_at))}</div>
            </div>
            <span class="admin-order-status">${escapeHTML(String(order.status).replaceAll('_', ' '))}</span>
          </div>
          ${inventoryWarning}
          <div class="admin-order-grid">
            <section><h3>Customer & delivery</h3><p>${escapeHTML(customer)}</p><p>${escapeHTML(address.phone || '')}</p><p>${escapeHTML(destination)}</p></section>
            <section><h3>Items</h3><p>${itemText}</p></section>
            <section><h3>Payment & total</h3><p>${escapeHTML(payment ? payment.status : 'Not available')}</p><p><strong>${formatINR(order.total_paise)}</strong></p></section>
          </div>
          <div class="admin-order-actions">${action}</div>
        </article>`;
    }).join('');

    container.querySelectorAll('button[data-order-id]').forEach(button => {
      button.addEventListener('click', () => updateOrderStatus(button));
    });
  }

  async function updateOrderStatus(button) {
    const client = window.fashionSupabase;
    const orderId = button.dataset.orderId;
    const status = button.dataset.nextStatus;
    if (!client || !orderId || !status) return;
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Updating...';

    const { data, error } = await client.functions.invoke('admin-update-order-status', {
      body: { orderId, status }
    });
    if (error || !data?.success) {
      console.error('Order status update failed:', error || data?.error);
      alert(data?.error || error?.message || 'Could not update this order. Please try again.');
      button.disabled = false;
      button.textContent = label;
      return;
    }
    await loadOrders();
  }

  async function loadOrders() {
    const client = window.fashionSupabase;
    if (!client) {
      message('Store connection is unavailable. Please refresh the page.', true);
      return;
    }

    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      message('Please log in with an administrator account.');
      return;
    }

    const { data: profile, error: profileError } = await client
      .from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profileError || profile?.role !== 'admin') {
      message('Access denied. This page is available to authorized administrators only.', true);
      return;
    }

    const { data: orders, error } = await client
      .from('orders')
      .select('id,user_id,status,total_paise,created_at,shipping_address,inventory_issue,order_items(product_name,quantity),payments(status)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Admin orders query failed:', error);
      message('We could not load orders. Please refresh and try again.', true);
      return;
    }
    renderOrders(orders || []);
  }

  document.addEventListener('DOMContentLoaded', loadOrders);
})();
