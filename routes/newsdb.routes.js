const router = require("express").Router();
const axios = require("axios");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("natural").stopwords;

const testText = "Saskia Junge seb@gmail.com.   PR Manager I Brand Pier GmbH  tel +49 40 80 8114 462  mobil +49 173 5499984  fax +49 40 80 8114 199  Brand Pier GmbH  Zirkusweg 2 I 20359 Hamburg I Germany  Sitz der Gesellschaft: Hamburg  Registergericht: Amtsgericht Hamburg, HRB 138899  Geschäftsführer: Carina C. Grendel, Ilja C. Grendel, Henk Knaupe  Think before you print!  Hier können Sie sich   abmelden .  Attachments  Neue Gebinde von Castrol  Castrol new bottle design.jpg  Castrol Experte Dominic Adametz  IMG_5625.jpeg  Castrol Logo  Castrol Horizontal Logo RGB...  Castrol Logo: 125 Jahre  Castrol Logo 125 Jahre.jpg  Artikel ";


const processText = (text) => {
    // tokenization of the text with the tokenizer object provided by the "natural" library
    const testArray = [];
    const words = tokenizer.tokenize(text);
    words.forEach((word) => {
        const lowercaseWord = word.toLowerCase(); // Convert to lowercase for case-insensitive comparison
        if (!stopwords.includes(lowercaseWord)) testArray.push(word);
    });
    console.log(testArray)
}

const extractEmails = (text) => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\W|$)/g;
    const emails = text.match(emailRegex);
    
    if (!emails) return [];

    // Extract 100 characters before and after each email
    const emailsWithContext = emails.map(email => {
        const startIndex = text.indexOf(email);
        const contextStart = Math.max(0, startIndex - 100);
        const contextEnd = Math.min(startIndex + email.length + 100, text.length);
        const context = text.substring(contextStart, contextEnd);
        return { email, context };
    });

    return emailsWithContext;
};

const extractPhoneNumbers = (emailContexts) => {

}


router.post("/", async (req, res) => {
    
    const { text } = req.body;
    const myEmails = extractEmails(testText);
    console.log(myEmails);



})

module.exports = router;