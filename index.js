const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/track', async (req, res) => {
  const { number, type, sealine } = req.query;
  const url = `https://www.searates.com/es/container/tracking/?number=${number}&type=${type}&sealine=${sealine}`;

  try {
    // Lanzar un navegador con Puppeteer
    const browser = await puppeteer.launch({ 
        slowMo: 200,
        headless: true,
        args: ['--disable-web-security'] // Deshabilitar la política de CORS
    });
    const page = await browser.newPage();
    // Set the viewport to 1920x1080
    await page.setViewport({ width: 1920, height: 1080 });

    // Navegar a la URL proporcionada
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Esperar a que el elemento esté disponible
    await page.waitForFunction(() => {
      const shadowRoot = document.querySelector("#tracking_system_root").shadowRoot;
      return shadowRoot && shadowRoot.querySelector("#app-root > div.jNVSgr > div.J_fGwb > div > div");
    });

    // Extraer el HTML del elemento especificado
    const element1 = await page.evaluateHandle(() => {
        return document.querySelector("#tracking_system_root").shadowRoot.querySelector("#app-root > div.jNVSgr > div.VvPpX6 > div");
    });

    const html1 = await page.evaluate(element => element.outerHTML, element1);

    const element2 = await page.evaluateHandle(() => {
        return document.querySelector("#tracking_system_root").shadowRoot.querySelector("#app-root > div.jNVSgr > div.J_fGwb > div > div");
    });

    await element2.screenshot({ path: 'data/element2.png' });

    // Cerrar el navegador
    await browser.close();

    // Responder con el contenido extraído
    res.json({ html1 });
  } catch (error) {
    console.error('Error al extraer el HTML:', error);
    res.status(500).json({ error: 'Error al extraer el HTML' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
