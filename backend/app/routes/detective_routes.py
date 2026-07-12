from fastapi import APIRouter
from pydantic import BaseModel
import random
from app.models.user import User
from app.models.detective_session import DetectiveSession
from app.database.db import SessionLocal

from app.services.gemini_service import (
    generate_detective_mission,
    evaluate_detective_mission
)

router = APIRouter(
    prefix="/detective",
    tags=["Detective"]
)


FALLBACK_MISSIONS = [

{
"story":
"Ravi went to the library after school. He borrowed a science book and met his friend Arjun there.",

"questions":[

{
"type":"memory",
"question":"What book did Ravi borrow?"
},

{
"type":"attention",
"question":"Where did Ravi go after school?"
},

{
"type":"reasoning",
"question":"Why might Ravi have gone to the library?"
},

{
"type":"sequence",
"question":"Who did Ravi meet at the library?"
}

],

"answers":[
"science book",
"library",
"study",
"arjun"
]
},

{
"story":
"Anita bought apples and oranges from the market. On the way home she gave two apples to her sister.",

"questions":[

{
"type":"memory",
"question":"What fruits did Anita buy?"
},

{
"type":"attention",
"question":"How many apples did Anita give away?"
},

{
"type":"reasoning",
"question":"Who received the apples?"
},

{
"type":"sequence",
"question":"Where did Anita buy the fruits?"
}

],

"answers":[
"apples and oranges",
"two",
"sister",
"market"
]
},

{
"story":
"Rahul woke up at 6 AM. He brushed his teeth, ate breakfast and then went for a morning walk in the park.",

"questions":[

{
"type":"memory",
"question":"What time did Rahul wake up?"
},

{
"type":"attention",
"question":"Where did Rahul go after breakfast?"
},

{
"type":"reasoning",
"question":"Why do people go for morning walks?"
},

{
"type":"sequence",
"question":"What did Rahul do before breakfast?"
}

],

"answers":[
"6 am",
"park",
"exercise",
"brushed his teeth"
]
}

]

class DetectiveSubmission(BaseModel):

    story: str

    questions: list

    answers: list

    email: str


def calculate_rank(xp):

    if xp >= 1000:
        return "Mentor"

    if xp >= 600:
        return "Strategist"

    if xp >= 300:
        return "Researcher"

    if xp >= 100:
        return "Scholar"

    return "Explorer"


@router.get("/mission")
def get_mission():

    try:

        mission = (
            generate_detective_mission()
        )

        mission["source"] = "gemini"

        return mission

    except Exception as e:

        print(
            "Mission Generation Error:",
            str(e)
        )

        mission = random.choice(
            FALLBACK_MISSIONS
        )

        mission["source"] = "fallback"

    return mission


def fallback_detective_evaluation(
    mission_questions,
    user_answers
):

    score = 0

    for answer in user_answers:

        if len(
            answer.strip()
        ) > 2:

            score += 25

    score = min(
        score,
        100
    )

    return {

        "memory": score,

        "attention": score,

        "reasoning": score,

        "language": score,

        "overall": score,

        "fallback": True
    }


@router.post("/evaluate")
def evaluate(
    data: DetectiveSubmission
):

    try:

        result = (
            evaluate_detective_mission(
                data.story,
                data.questions,
                data.answers
            )
        )

    except Exception as e:

     print(
        "Gemini Evaluation Error:",
        str(e)
        )

     result = (
        fallback_detective_evaluation(
            data.questions,
            data.answers
        )
      )

    result.setdefault(
        "memory",
        0
    )

    result.setdefault(
        "attention",
        0
    )

    result.setdefault(
        "reasoning",
        0
    )

    result.setdefault(
        "language",
        0
    )

    result.setdefault(
        "overall",
        0
    )

    overall = int(
        result["overall"]
    )

    xp = overall // 2

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    updated_xp = 0
    updated_rank = "Explorer"

    if user:

        user.xp = (
            user.xp or 0
        ) + xp

        user.total_sessions = (
            user.total_sessions or 0
        ) + 1

        user.rank = calculate_rank(
            user.xp
        )

        updated_xp = user.xp

        updated_rank = user.rank

    session = DetectiveSession(

        user_email=data.email,

        memory=int(
            result["memory"]
        ),

        attention=int(
            result["attention"]
        ),

        reasoning=int(
            result["reasoning"]
        ),

        language=int(
            result["language"]
        ),

        overall=int(
            result["overall"]
        ),

        xp=xp
    )

    db.add(session)

    db.commit()

    db.close()

    return {

        **result,

        "xp":
            xp,

        "user_xp":
            updated_xp,

        "user_rank":
            updated_rank
    }