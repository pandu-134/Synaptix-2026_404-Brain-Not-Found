from flask import Flask, request, jsonify
from flask_cors import CORS

# Import your team's modules!
from adaptive_engine import get_next_question_difficulty
from question_generator import generate_dynamic_question

app = Flask(__name__)
CORS(app) 

@app.route('/api/start-test', methods=['GET'])
def start_test():
    # Start the user with a Medium (3) difficulty question in a default topic
    starting_topic = "Programming Fundamentals"
    starting_difficulty = 3
    
    # Generate the very first question live
    first_question = generate_dynamic_question(starting_topic, starting_difficulty)
    
    return jsonify({
        "status": "success",
        "question": first_question
    })

@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    # 1. Receive data from Member 1's frontend
    data = request.json
    topic = data.get('topic', 'Programming Fundamentals')
    current_difficulty = data.get('current_difficulty', 3)
    is_correct = data.get('is_correct', False)

    # 2. Use Member 3's logic to calculate the NEXT difficulty
    new_difficulty = get_next_question_difficulty(current_difficulty, is_correct)

    # 3. Use Member 4's generator to create the NEXT question
    next_question = generate_dynamic_question(topic, new_difficulty)

    # 4. Send the perfectly adapted question back to the frontend
    return jsonify({
        "status": "success",
        "message": "Answer processed",
        "new_difficulty": new_difficulty,
        "question": next_question
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)