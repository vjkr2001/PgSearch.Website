function handleSearch(event) {
    var keyPressed = event.which || event.keyCode;
    if (keyPressed === 13) { // 13 corresponds to Enter key
        performSearch();
    }
}

function performSearch() {
    var searchTerm = document.getElementById("searchInput").value.toLowerCase();
    var mainContent = document.getElementById("mainContent");
    var searchResults = [];

    var elementsToSearch = mainContent.querySelectorAll("p, h1, h2, h3, h4, h5, h6, a");

    elementsToSearch.forEach(element => {
        var text = element.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            var modifiedText = text.replace(new RegExp(searchTerm, 'gi'), '<span class="searched-text">' + searchTerm + '</span>');
            element.innerHTML = modifiedText;
            searchResults.push(element);
        }
    });

    if (searchResults.length > 0) {
        searchResults[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', pgSearch);
  
    function pgSearch() {
      const cityDropdown = document.getElementById('city-dropdown');
      const locationInput = document.getElementById('location');
      const roomTypeDropdown = document.getElementById('room-type-dropdown');
      
  
      const city = cityDropdown.value;
      const location = locationInput.value;
      const roomType = roomTypeDropdown.value;
      
  
      // Send a request to the server to get search results
      fetch(`/search?city=${city}&location=${location}&roomType=${roomType}`)
        .then(response => response.json())
        
        .then(data => {
          const searchResultsContainer = document.querySelector('.search-results');
          searchResultsContainer.innerHTML = '';

          if (data.length === 0) {
            searchResultsContainer.innerHTML = 'Currently there are no pgs based on your info';
            return;
          }
  
          data.forEach(pg => {
            const resultBox = document.createElement('div');
            resultBox.classList.add('result-box');
  
            resultBox.innerHTML = `
              <h4>${pg.pgname}</h4>
              <p>Locality: ${pg.locality}</p>
              <p>Share Option: ${pg.share_option}</p>
              <p>Owner Name: ${pg.ownername}</p>
              <p>Contact Number: ${pg.contactnumber}</p>
              
              <div class="price-box">
              <p class="price">Price: ${pg.price}</p>
              </div>               
            `;
  
            searchResultsContainer.appendChild(resultBox);
          });
        })
        .catch(error => console.error(error));
    }
  });
  