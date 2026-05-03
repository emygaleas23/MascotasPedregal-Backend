import axios from "axios";

export async function getRandomFact(req, res) {
    try {
        // Obtener el dato en inglés
        const response = await axios.request({
            method: 'GET',
            url: "https://random-dog-facts.p.rapidapi.com/api/dogs",
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST_DOGS
            }
        });
        const factInEnglish = response.data?.fact || "No se encontró ningún dato.";

        // Traducir al español
        let translatedText = factInEnglish;
        try {
            const translationResponse = await axios.request({
                method: 'POST',
                url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key':process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST_TRANSLATE
                },
                data: { q: factInEnglish, source: 'en', target: 'es' }
            });
            translatedText = translationResponse.data.data.translations.translatedText;
        } catch (translateError) {
            console.warn("Error en la traducción, se usará inglés:", translateError.message);
        }

        // Enviar datos al cliente
        res.json({ fact_en: factInEnglish, fact_es: translatedText });

    } catch (error) {
        console.error("Error al obtener el dato:", error.message);
        res.json({
            fact_en: "Dogs can learn over 1000 words and gestures.",
            fact_es: "Los perros pueden aprender más de 1000 palabras y gestos."
        });
    }
}
export default { getRandomFact };
