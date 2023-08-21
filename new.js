function pgSearch() {
    const city = document.getElementById('city-dropdown').value;
    const shareOption = document.getElementById('room-type-dropdown').value;
    const locality = document.getElementById('location').value;

    // Send a request to the server to fetch matching PGs
    fetch(`/search?city=${city}&shareOption=${shareOption}&locality=${locality}`)
        .then(response => response.json())
        .then(results => {
            // Handle the search results and update the HTML content
            const searchResultsDiv = document.querySelector('.search-results');
            searchResultsDiv.innerHTML = '';

            if (results.length === 0) {
                searchResultsDiv.innerHTML = '<p>No matching PGs found.</p>';
            } else {
                results.forEach(result => {
                    const pgBox = document.createElement('div');
                    pgBox.classList.add('pg-box');
                    pgBox.innerHTML = `
                        <h2>${result.pgname}</h2>
                        <p>Location: ${result.locality}, ${result.location}</p>
                        <p>Room Type: ${result.share_option} Share</p>
                        <p class="price">Price: ${result.price}</p>
                        <p>Owner: ${result.ownername}</p>
                        <p>Contact: ${result.contactnumber}</p>
                    `;
                    searchResultsDiv.appendChild(pgBox);
                });
            }
        })
        .catch(error => {
            console.log(error);
            alert('An error occurred while fetching data.');
        });
}
