// server/routes/location.js
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY;

// 🔹 Reverse geocode lat/lng → city/state
router.get("/rev_geocode", async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const url = `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.status(400).json({ error: data.error });

    res.json({
      city: data.address.city || data.address.town || data.address.village || "",
      state: data.address.state || "",
      district: data.address.county || "",
      postalCode: data.address.postcode || "",
      lat: data.lat,
      lng: data.lon,
      fullData: data
    });
  } catch (err) {
    console.error("Reverse geocode error:", err);
    res.status(500).json({ error: "Failed to fetch reverse geocode" });
  }
});

// 🔹 Forward Geocode (Search place by query)
router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) return res.json({ results: [] });

    const results = data.map((place) => ({
      city: place.address?.city || place.address?.town || place.address?.village || "",
      state: place.address?.state || "",
      district: place.address?.county || "",
      lat: place.lat,
      lng: place.lon,
      postalCode: place.address?.postcode || "",
      display_name: place.display_name,
      fullData: place
    }));

    res.json({ results });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search location" });
  }
});

// 🔹 Autocomplete (suggestions while typing)
router.get("/autocomplete", async (req, res) => {
  const { query } = req.query;
  try {
    const url = `https://us1.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&limit=5&dedupe=1`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ error: "Failed to get autocomplete" });
  }
});

// 🔹 Distance Matrix (between multiple points)
router.get("/distance", async (req, res) => {
  const { origins, destinations } = req.query;
  try {
    const url = `https://us1.locationiq.com/v1/matrix/driving/${origins};${destinations}?key=${LOCATIONIQ_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Distance error:", err);
    res.status(500).json({ error: "Failed to get distance" });
  }
});

// 🔹 Directions / Routing
router.get("/directions", async (req, res) => {
  const { start, end } = req.query; // "lat,lon"
  try {
    const url = `https://us1.locationiq.com/v1/directions/driving/${start};${end}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Directions error:", err);
    res.status(500).json({ error: "Failed to get directions" });
  }
});

// 🔹 Static Map (get map image with markers)
router.get("/staticmap", async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const url = `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_KEY}&center=${lat},${lng}&zoom=13&size=600x400&markers=icon:large-red-cutout|${lat},${lng}`;
    res.json({ mapUrl: url });
  } catch (err) {
    console.error("Static map error:", err);
    res.status(500).json({ error: "Failed to get static map" });
  }
});

module.exports = router;
