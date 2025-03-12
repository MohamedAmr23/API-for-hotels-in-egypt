// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT =  1000;

app.use(cors());
app.use(express.json());

// Array to store hotel data
const hotels = [];

// Read CSV file and parse data
fs.createReadStream('Egypt_hotels_data.csv') 
  .pipe(csv())
  .on('data', (row) => {
    hotels.push({
      type: row.Type,
      name: row.Name,
      link: row.Link,
      location: {
        latitude: parseFloat(row.Latitude),
        longitude: parseFloat(row.Longitude)
      },
      checkIn: row['Check-In Time'],
      checkOut: row['Check-Out Time'],
      ratings: {
        overall: parseFloat(row['Overall Rating']),
        location: parseFloat(row['Location Rating'])
      },
      reviews: parseInt(row.Reviews),
      amenities: row.Amenities ? row.Amenities.split(', ') : [],
      excludedAmenities: row['Excluded Amenities'] ? row['Excluded Amenities'].split(', ') : [],
      essentialInfo: row['Essential Info'],
      nearbyPlaces: row['Nearby Places'],
      ratingsBreakdown: row['Ratings Breakdown'],
      reviewsBreakdown: row['Reviews Breakdown'],
      pricing: {
        lowestRate: row['Rate per Night (Lowest)'],
        beforeTaxes: row['Rate per Night (Before Taxes and Fees)'],
        totalLowest: row['Total Rate (Lowest)'],
        totalBeforeTaxes: row['Total Rate (Before Taxes and Fees)']
      }
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// API endpoints
app.get('/api/hotels', (req, res) => {
  res.json(hotels);
});

// Get hotel by name
app.get('/api/hotels/:name', (req, res) => {
  const hotel = hotels.find(h => h.name.toLowerCase() === req.params.name.toLowerCase());
  
  if (hotel) {
    res.json(hotel);
  } else {
    res.status(404).json({ message: 'Hotel not found' });
  }
});

// Filter hotels by type
app.get('/api/hotels/filter/type/:type', (req, res) => {
  const filteredHotels = hotels.filter(
    h => h.type.toLowerCase() === req.params.type.toLowerCase()
  );
  res.json(filteredHotels);
});

// Filter hotels by rating (greater than or equal to)
app.get('/api/hotels/filter/rating/:rating', (req, res) => {
  const filteredHotels = hotels.filter(
    h => h.ratings.overall >= parseFloat(req.params.rating)
  );
  res.json(filteredHotels);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});