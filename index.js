const browserObject = require('./browser');
const scraperController = require('./src/controller/santaClaraController');

// Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
scraperController(browserInstance);
