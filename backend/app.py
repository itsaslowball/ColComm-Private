from flask import Flask, request, jsonify
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer

app = Flask(__name__)


model_path = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer_path = "cardiffnlp/twitter-roberta-base-sentiment-latest"
model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
sentiment_task = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)



@app.route("/predictSentiment", methods=["POST"])
def predict_sentiment():
    try:
        
        input_text = request.json["text"]

        
        result = sentiment_task(input_text)

        
        return jsonify(result)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    
    app.run(port=5000)
