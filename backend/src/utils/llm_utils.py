# LLM utility functions

import os
from fastapi import HTTPException, status
from dotenv import load_dotenv
from mistralai import Mistral

load_dotenv()

# Initialize Mistral client
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_CLIENT = None

if MISTRAL_API_KEY:
    MISTRAL_CLIENT = Mistral(api_key=MISTRAL_API_KEY)


async def execute_llm(prompt: str, instructions: str = "") -> str:
    """Execute the Mistral LLM with the given prompt and instructions."""
    if not MISTRAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MISTRAL_API_KEY environment variable is not set"
        )
    
    try:
        # Build the full prompt with instructions
        full_prompt = ""
        if instructions and instructions.strip() and instructions != "Add Instructions":
            full_prompt += f"Instructions: {instructions}\n\n"
        full_prompt += prompt

        print(full_prompt, "full_prompt")
        chat_response = await MISTRAL_CLIENT.chat.complete_async(
            model='mistral-large-latest',
            messages=[
                {
                    "role": "user",
                    "content": full_prompt,
                },
            ]
        )
        return chat_response.choices[0].message.content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing Mistral: {str(e)}"
        )
