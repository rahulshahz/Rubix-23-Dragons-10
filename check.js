var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var docx = sentiment.analyze("I like apples");
console.log(docx);

// Applying to An Array
var mydocx = ["I don't love apples","I don't eat pepper","yoyoyoyo yoyo yo","this book is the best"]

mydocx.forEach(function(s){
	console.log(sentiment.analyze(s));
})

const data = JSON.stringify({
	"input": "Alexander the Great said: There is nothing impossible to him who will try."
});

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
	}
});

xhr.open("POST", "https://paraphraser1.p.rapidapi.com/");
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("X-RapidAPI-Key", "e41dedd1f2msh86c354bc140a33fp11779cjsn49f416258ead");
xhr.setRequestHeader("X-RapidAPI-Host", "paraphraser1.p.rapidapi.com");

xhr.send(data);