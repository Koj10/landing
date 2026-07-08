const PERIOD_ORDER = { бесконечный: 0, дневной: 1, вечерний: 2, ночной: 3 };
const DURATION_ORDER = { 60: 0, 180: 1, 300: 2, 600: 3 };

function formatPackageLabel(item) {
    const minutes = Number(item.duration_minutes);
    const period = item.time_period;

    if (period === 'бесконечный' && minutes === 60) return '1 час';
    if (period === 'дневной' && minutes === 60) return '1 час (08:00–14:00)';
    if (period === 'дневной' && minutes === 180) return '3 часа (08:00–14:00)';
    if (period === 'вечерний' && minutes === 180) return '3 часа (17:00–22:00)';
    if (period === 'вечерний' && minutes === 300) return '5 часов (17:00–22:00)';
    if (period === 'ночной' && minutes === 600) return 'Ночь 22:00–08:00';

    const hours = minutes >= 60 ? Math.round(minutes / 60) : minutes;
    return hours >= 60 ? `${Math.round(hours / 60)} ч` : `${minutes} мин`;
}

function sortPackages(items) {
    return [...items].sort((a, b) => {
        const periodDiff = (PERIOD_ORDER[a.time_period] ?? 9) - (PERIOD_ORDER[b.time_period] ?? 9);
        if (periodDiff !== 0) return periodDiff;
        return (DURATION_ORDER[a.duration_minutes] ?? 9) - (DURATION_ORDER[b.duration_minutes] ?? 9);
    });
}

function buildPriceList(items, priceField) {
    const list = document.createElement('ul');
    list.className = 'landing-price-list';

    sortPackages(items).forEach((item) => {
        const li = document.createElement('li');
        const price = Math.round(Number(item[priceField] ?? item.price ?? 0));
        li.innerHTML = `<span>${formatPackageLabel(item)}</span><strong>${price} ₽</strong>`;
        list.appendChild(li);
    });

    return list;
}

function buildPriceCard(zoneKey, title, subtitle, spec, weekdayItems, weekendItems) {
    const card = document.createElement('article');
    card.className = 'landing-price-card';
    card.dataset.zone = zoneKey;

    const head = document.createElement('div');
    head.className = 'landing-price-card__head';
    head.innerHTML = `
        <h3>${title}</h3>
        <p>${subtitle}</p>
        <span class="landing-price-card__spec">${spec}</span>
    `;
    card.appendChild(head);

    const weekdayList = buildPriceList(weekdayItems, 'price');
    weekdayList.dataset.pricesWeekday = '';
    card.appendChild(weekdayList);

    const weekendList = buildPriceList(weekendItems, 'price');
    weekendList.dataset.pricesWeekend = '';
    weekendList.hidden = true;
    card.appendChild(weekendList);

    return card;
}

function renderPricing(grid, packages) {
    const weekday = packages.filter((item) => Number(item.is_weekend) === 0);
    const weekend = packages.filter((item) => Number(item.is_weekend) === 1);

    grid.replaceChildren(
        buildPriceCard(
            'standard',
            'STANDARD',
            'Игровой зал',
            'RTX 3060 Ti · i5-12400F · 280 Hz',
            weekday,
            weekend,
        ),
        buildPriceCard(
            'vip',
            'VIP',
            'Премиум-зона',
            'RTX 3060 Ti · i5-12400F · 280 Hz',
            weekday.map((item) => ({ ...item, price: item.price_vip ?? item.price })),
            weekend.map((item) => ({ ...item, price: item.price_vip ?? item.price })),
        ),
    );
}

function initPricingTabs() {
    const tabs = document.querySelector('[data-pricing-days]');
    if (!tabs) return;

    tabs.addEventListener('click', (event) => {
        const button = event.target.closest('[data-day]');
        if (!button) return;

        tabs.querySelectorAll('.landing-tab').forEach((tab) => {
            tab.classList.toggle('is-active', tab === button);
        });

        const isWeekend = button.dataset.day === 'weekend';
        document.querySelectorAll('[data-prices-weekday]').forEach((list) => {
            list.hidden = isWeekend;
        });
        document.querySelectorAll('[data-prices-weekend]').forEach((list) => {
            list.hidden = !isWeekend;
        });
    });
}

async function loadPricing() {
    const grid = document.getElementById('pricingGrid');
    if (!grid) return;

    const apiUrl = (grid.dataset.apiUrl || '').replace(/\/+$/, '');
    const appUrl = (grid.dataset.appUrl || '').replace(/\/+$/, '');

    initPricingTabs();

    if (!apiUrl) {
        grid.innerHTML = '<p class="landing-pricing-loading">Тарифы временно недоступны.</p>';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/time_packages`, {
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('empty');
        }

        renderPricing(grid, data);
    } catch (error) {
        grid.innerHTML = `
            <p class="landing-pricing-loading">
                Не удалось загрузить тарифы.
                ${appUrl ? `<a href="${appUrl}/price">Смотреть в личном кабинете</a>` : ''}
            </p>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadPricing);
