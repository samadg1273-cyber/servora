
// SERVORA - Customer Panel

// Booking Form Select Karo
const bookingForm = document.querySelector('#booking-form');
// Booking Form Submit Event
if (bookingForm) {
    bookingForm.addEventListener('submit', function(event) {

        // Page Reload Rokna
        event.preventDefault();

        // Form Values Lena
        const service = bookingForm.querySelector('select').value;
        const address = bookingForm.querySelector('textarea').value;
        const date = bookingForm.querySelector('input[type="date"]').value;
        const time = bookingForm.querySelector('input[type="time"]').value;

        // Validation
        if (!service || !address || !date || !time) {
            alert('Please fill all booking details.');
            return;
        }

        // Confirmation
        alert(
            'Booking request submitted successfully!\n' +
            'Service: ' + service + '\n' +
            'Date: ' + date + '\n' +
            'Time: ' + time
        );

        // Form Reset
        bookingForm.reset();

    });
}
