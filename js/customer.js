// SERVORA CUSTOMER PANEL — front-end demo storage (this browser/device only)
(() => {
    'use strict';

    const PROFILE_KEY = 'servoraCustomerProfile';
    const BOOKINGS_KEY = 'servoraCustomerBookings';
    const COMPLAINTS_KEY = 'servoraCustomerComplaints';
    const REVIEWS_KEY = 'servoraCustomerReviews';

    const $ = (id) => document.getElementById(id);
    const readStore = (key, fallback) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch (error) {
            console.warn(`Could not read ${key} from local storage.`, error);
            return fallback;
        }
    };
    const writeStore = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            alert('Browser storage is unavailable. Please check your browser settings.');
            console.error(error);
            return false;
        }
    };

    let profile = readStore(PROFILE_KEY, {});
    let bookings = readStore(BOOKINGS_KEY, []);
    let currentView = 'all';

    const profileFields = {
        name: 'profile-name', mobile: 'profile-mobile', email: 'profile-email',
        city: 'profile-city', address: 'profile-address', pincode: 'profile-pincode'
    };

    function saveProfile(showMessage = false) {
        Object.entries(profileFields).forEach(([key, id]) => {
            profile[key] = $(id).value.trim();
        });
        const saved = writeStore(PROFILE_KEY, profile);
        $('profile-save-status').textContent = saved ? 'Saved on this device' : 'Not saved';
        updateWelcome();
        if (showMessage && saved) $('profile-save-status').textContent = 'Profile saved ✓';
    }

    function loadProfile() {
        Object.entries(profileFields).forEach(([key, id]) => {
            $(id).value = profile[key] || '';
        });
        $('booking-name').value = profile.name || '';
        $('booking-mobile').value = profile.mobile || '';
        updateWelcome();
    }

    function updateWelcome() {
        const firstName = (profile.name || '').trim().split(/\s+/)[0];
        $('welcome-name').textContent = firstName ? `Good to see you, ${firstName}.` : "Let's make home better.";
    }

    function validMobile(value) {
        return /^[6-9]\d{9}$/.test(value.trim());
    }

    function setStep(step) {
        $('booking-step-one').classList.toggle('hidden', step !== 1);
        $('booking-step-two').classList.toggle('hidden', step !== 2);
        $('step-indicator-1').classList.toggle('active', step === 1);
        $('step-indicator-2').classList.toggle('active', step === 2);
        if (step === 2) {
            const name = $('booking-name').value.trim();
            const service = $('booking-service').value;
            $('booking-summary').innerHTML = `<strong>${escapeHTML(name)}</strong> · ${escapeHTML(service)} — add your visit details below.`;
        }
    }

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    }

    function createBookingId() {
        return `SV-${Date.now().toString().slice(-6)}`;
    }

    function handleBookingSubmit(event) {
        event.preventDefault();
        const name = $('booking-name').value.trim();
        const mobile = $('booking-mobile').value.trim();
        const service = $('booking-service').value;
        if (name.length < 2) return alert('Please enter your full name.');
        if (!validMobile(mobile)) return alert('Please enter a valid 10-digit Indian mobile number.');
        if (!service) return alert('Please select a service.');

        profile.name = name;
        profile.mobile = mobile;
        saveProfileFromBooking();
        setStep(2);
        $('booking-date').min = new Date().toISOString().split('T')[0];
        $('booking-date').focus();
    }

    function saveProfileFromBooking() {
        profile.name = $('booking-name').value.trim();
        profile.mobile = $('booking-mobile').value.trim();
        writeStore(PROFILE_KEY, profile);
        $('profile-name').value = profile.name;
        $('profile-mobile').value = profile.mobile;
        updateWelcome();
    }

    function confirmBooking(event) {
        event.preventDefault();
        const date = $('booking-date').value;
        const locality = $('booking-location').value.trim();
        const address = $('booking-address').value.trim();
        if (!date) return alert('Please select your preferred date.');
        if (!locality) return alert('Please enter your area or locality.');
        if (!address) return alert('Please enter your complete service address.');

        const booking = {
            id: createBookingId(), name: $('booking-name').value.trim(), mobile: $('booking-mobile').value.trim(),
            service: $('booking-service').value, date, time: $('booking-time').value || 'No preference',
            locality, address, problem: $('booking-problem').value.trim(), status: 'Active',
            createdAt: new Date().toISOString()
        };
        bookings.unshift(booking);
        if (!writeStore(BOOKINGS_KEY, bookings)) {
            bookings.shift();
            return;
        }

        $('booking-step-two').classList.add('hidden');
        $('booking-success').classList.remove('hidden');
        $('booking-success').innerHTML = `<strong>✓ Booking request saved successfully!</strong>Your reference ID is <b>${escapeHTML(booking.id)}</b>. ${escapeHTML(booking.service)} · ${escapeHTML(booking.date)} · ${escapeHTML(booking.time)}. This is a demo booking stored on this device.`;
        $('booking-step-one').reset();
        $('booking-step-two').reset();
        $('booking-name').value = profile.name || booking.name;
        $('booking-mobile').value = profile.mobile || booking.mobile;
        $('booking-service').value = '';
        setStep(1);
        renderBookings();
        updateStats();
        $('my-bookings').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateStats() {
        $('total-bookings').textContent = bookings.length;
        $('active-bookings').textContent = bookings.filter((booking) => booking.status !== 'Completed' && booking.status !== 'Cancelled').length;
        $('completed-bookings').textContent = bookings.filter((booking) => booking.status === 'Completed').length;
    }

    function renderBookings() {
        const list = $('bookings-list');
        const visible = bookings.filter((booking) => {
            if (currentView === 'active') return booking.status !== 'Completed' && booking.status !== 'Cancelled';
            if (currentView === 'completed') return booking.status === 'Completed';
            return true;
        });
        const headings = { all: 'My bookings', active: 'Active bookings', completed: 'Completed services' };
        $('bookings-heading').textContent = headings[currentView];
        if (!visible.length) {
            const message = currentView === 'completed' ? 'Completed services will appear here once a service is marked complete.' : 'Your bookings and service history will appear here.';
            list.innerHTML = `<div class="empty-state"><span>▤</span><h3>${currentView === 'completed' ? 'No completed services yet' : 'No bookings yet'}</h3><p>${message}</p></div>`;
            return;
        }
        list.innerHTML = visible.map((booking) => `
            <article class="booking-item">
                <div><span class="booking-id">${escapeHTML(booking.id)}</span><h3>${escapeHTML(booking.service)}</h3><p class="booking-meta">${escapeHTML(booking.date)} · ${escapeHTML(booking.time)} · ${escapeHTML(booking.locality)}</p></div>
                <span class="booking-status ${booking.status === 'Completed' ? 'completed' : ''}">${escapeHTML(booking.status)}</span>
                <div class="booking-actions"><button class="detail-toggle" type="button" data-booking-id="${escapeHTML(booking.id)}">View details ↓</button></div>
                <div class="booking-details hidden" id="details-${escapeHTML(booking.id)}"><b>Customer:</b> ${escapeHTML(booking.name)}<br><b>Mobile:</b> ${escapeHTML(booking.mobile)}<br><b>Service address:</b> ${escapeHTML(booking.address)}<br><b>Requirement:</b> ${escapeHTML(booking.problem || 'Not provided')}<br><b>Booking status:</b> ${escapeHTML(booking.status)}</div>
            </article>`).join('');
    }

    function showView(view) {
        currentView = view;
        renderBookings();
        $('my-bookings').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    $('booking-step-one').addEventListener('submit', handleBookingSubmit);
    $('booking-step-two').addEventListener('submit', confirmBooking);
    $('back-to-step-one').addEventListener('click', () => setStep(1));
    $('profile-form').addEventListener('input', () => saveProfile(false));
    $('profile-form').addEventListener('submit', (event) => { event.preventDefault(); saveProfile(true); });

    // Keep the first-step contact details in sync with the saved profile.
    $('booking-name').addEventListener('input', () => { profile.name = $('booking-name').value; updateWelcome(); });
    $('booking-mobile').addEventListener('input', () => { profile.mobile = $('booking-mobile').value; });
    $('booking-name').addEventListener('blur', saveProfileFromBooking);
    $('booking-mobile').addEventListener('blur', saveProfileFromBooking);

    document.querySelectorAll('.choose-service').forEach((button) => {
        button.addEventListener('click', () => {
            $('booking-service').value = button.dataset.service;
            $('book-service').scrollIntoView({ behavior: 'smooth', block: 'start' });
            $('booking-name').focus({ preventScroll: true });
        });
    });

    document.querySelectorAll('.stat-card').forEach((card) => card.addEventListener('click', () => showView(card.dataset.view)));
    $('show-all-bookings').addEventListener('click', () => showView('all'));
    $('bookings-list').addEventListener('click', (event) => {
        const button = event.target.closest('[data-booking-id]');
        if (!button) return;
        const details = $(`details-${button.dataset.bookingId}`);
        details.classList.toggle('hidden');
        button.textContent = details.classList.contains('hidden') ? 'View details ↓' : 'Hide details ↑';
    });

    $('complaint-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const complaints = readStore(COMPLAINTS_KEY, []);
        complaints.unshift({ bookingId: $('complaint-booking').value.trim(), type: $('complaint-type').value, details: $('complaint-details').value.trim(), createdAt: new Date().toISOString() });
        if (writeStore(COMPLAINTS_KEY, complaints)) {
            $('complaint-message').textContent = 'Your complaint has been saved in this browser demo.';
            event.target.reset();
        }
    });

    $('review-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const reviews = readStore(REVIEWS_KEY, []);
        reviews.unshift({ bookingId: $('review-booking').value.trim(), rating: $('review-rating').value, review: $('review-text').value.trim(), createdAt: new Date().toISOString() });
        if (writeStore(REVIEWS_KEY, reviews)) {
            $('review-message').textContent = 'Thank you! Your feedback has been saved in this browser demo.';
            event.target.reset();
        }
    });

    loadProfile();
    updateStats();
    renderBookings();
})();
