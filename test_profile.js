const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('C:\\Users\\Ansh\\.gemini\\antigravity\\scratch\\mc-stats\\better_life.html', 'utf8');
const dataJs = fs.readFileSync('C:\\Users\\Ansh\\.gemini\\antigravity\\scratch\\mc-stats\\data.js', 'utf8');
const appJs = fs.readFileSync('C:\\Users\\Ansh\\.gemini\\antigravity\\scratch\\mc-stats\\app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

// Mock globals
window.Chart = function() { return { destroy: () => {} }; };
window.skinview3d = {
    SkinViewer: function() { this.canvas = document.createElement('canvas'); this.dispose = () => {}; },
    createOrbitControls: function() { return {}; }
};

try {
    window.eval(dataJs);
    window.eval(appJs);
    
    // Simulate clicking a profile
    console.log("Calling openProfile...");
    window.openProfile('901bc959-6b58-31c0-8398-03f9238d689a');
    console.log("openProfile executed successfully!");
} catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
}
