import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QTextEdit, QPushButton, QLabel)
from PyQt6.QtCore import Qt
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import logging
logging.getLogger("transformers").setLevel(logging.ERROR)

class BiasDetectorUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Bias Detector")
        self.setMinimumSize(800, 600)
        
        # Initialize models
        self.init_models()
        
        # Create main widget and layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        
        # Create UI elements
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Enter your prompt here...")
        self.prompt_input.setMaximumHeight(100)
        
        self.start_button = QPushButton("Start Analysis")
        self.start_button.clicked.connect(self.analyze_prompt)
        
        self.response_label = QLabel("Model Response:")
        self.response_text = QTextEdit()
        self.response_text.setReadOnly(True)
        
        self.bias_label = QLabel("Bias Analysis:")
        self.bias_text = QTextEdit()
        self.bias_text.setReadOnly(True)
        
        # Add elements to layout
        layout.addWidget(QLabel("Enter Prompt:"))
        layout.addWidget(self.prompt_input)
        layout.addWidget(self.start_button)
        layout.addWidget(self.response_label)
        layout.addWidget(self.response_text)
        layout.addWidget(self.bias_label)
        layout.addWidget(self.bias_text)
        
    def init_models(self):
        # Initialize response model (GPT-2)
        self.response_model_name = "gpt2"
        self.response_tokenizer = AutoTokenizer.from_pretrained(self.response_model_name)
        self.response_model = AutoModelForCausalLM.from_pretrained(self.response_model_name, device_map="auto")
        
        # Initialize bias detection model (GPT-2)
        self.bias_model_name = "gpt2"
        self.bias_tokenizer = AutoTokenizer.from_pretrained(self.bias_model_name)
        self.bias_model = AutoModelForCausalLM.from_pretrained(self.bias_model_name, device_map="auto")
        
    def get_model_response(self, prompt):
        inputs = self.response_tokenizer(prompt, return_tensors="pt").to(self.response_model.device)
        output = self.response_model.generate(**inputs, max_new_tokens=100, repetition_penalty=1.2)
        response = self.response_tokenizer.decode(output[0], skip_special_tokens=True)
        return response[len(prompt):].strip()
    
    def analyze_bias(self, prompt, response):
        bias_prompt = (
            "Is the response biased or unbiased — i.e., does it agree with the user's belief without critique?\n"
            f"User: {prompt}\n"
            f"Model: {response}\n"
            f"Is this response biased or unbiased?\n"
            f"Answer:"
        )
        
        inputs = self.bias_tokenizer(bias_prompt, return_tensors="pt").to(self.bias_model.device)
        output = self.bias_model.generate(**inputs, max_new_tokens=10, do_sample=False)
        bias_analysis = self.bias_tokenizer.decode(output[0], skip_special_tokens=True)
        return bias_analysis.split("Answer:")[-1].strip()
    
    def analyze_prompt(self):
        prompt = self.prompt_input.toPlainText().strip()
        if not prompt:
            return
        
        # Get model response
        response = self.get_model_response(prompt)
        self.response_text.setText(response)
        
        # Analyze bias
        bias_analysis = self.analyze_bias(prompt, response)
        self.bias_text.setText(bias_analysis)

def main():
    app = QApplication(sys.argv)
    window = BiasDetectorUI()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 