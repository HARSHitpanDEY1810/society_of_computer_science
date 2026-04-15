/**
 * Handles dynamic navigation elements across the site
 */
async function syncDynamicNav() {
    try {
        const res = await fetch('http://localhost:5000/api/calendar');
        const data = await res.json();

        if (data && data.url && data.url !== "#") {
            const calendarLinks = document.querySelectorAll('.academic-calendar-link');
            calendarLinks.forEach(link => {
                link.href = data.url;
                link.target = "_blank"; // Open PDF in new tab
            });
        }
    } catch (err) {
        console.error('Error syncing dynamic navigation:', err);
    }
}

document.addEventListener('DOMContentLoaded', syncDynamicNav);
