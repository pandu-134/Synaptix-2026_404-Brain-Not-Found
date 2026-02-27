# backend/adaptive_engine.py
import random

def get_next_question_difficulty(current_difficulty, is_correct):
    """
    Micro-Adaptation: Runs after EVERY question.
    Scale: 1 (Very Easy), 2 (Easy), 3 (Medium), 4 (Hard), 5 (Very Hard)
    """
    # Rule 1: Currently Hard (4) or Very Hard (5)
    if current_difficulty >= 4:
        if is_correct:
            return 5  # Give Very Hard
        else:
            return random.choice([2, 3])  # Give Medium or Easy

    # Rule 2: Currently Medium (3)
    elif current_difficulty == 3:
        if is_correct:
            return 4  # Give Hard
        else:
            return 2  # Give Easy

    # Rule 3: Currently Easy (2) or Very Easy (1)
    elif current_difficulty <= 2:
        if is_correct:
            return random.choice([3, 4])  # Give Medium or Hard
        else:
            return 1  # Give Very Easy


def get_test2_starting_difficulty(test1_percentage):
    """
    Macro-Adaptation: Runs ONCE when Test 2 begins.
    """
    if test1_percentage > 70.0:
        return 5  # Start with Very Hard
    elif test1_percentage >= 50.0:
        return 3  # Start with Medium
    else:
        return 2  # Start with Easy