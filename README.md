# AI Bias Detection Interface

A web interface for detecting bias in AI model responses using GPT-2.

## Quick Start

1. Install dependencies:
```bash
pip install torch transformers pandas scikit-learn matplotlib datasets peft flask
```

2. Run the web interface:
```bash
python app.py
```

3. Open `http://localhost:5000` in your browser

## Usage

1. Enter a prompt and click "Generate Response"
2. Click "Evaluate Bias" to analyze the response
3. View results and interaction history below

## Project Files

- `static/`: Web interface files
- `finetuning_gpt/`: Model training scripts
- `interactive_prompts.py`: Prompt testing
- `compare_llm_to_gpt2.py`: Model comparison 