# AI Engineering Roadmap — Full-Stack with On-Device Spike

**Profile:** 8 years mobile (Flutter / Android / iOS), zero ML background
**Goal:** Career switch to full-stack AI engineer with a rare on-device / mobile-AI specialty
**Target role:** AI/ML Application Engineer — building, fine-tuning, and shipping AI systems
**Pace:** 2 hrs/day × 6 days/week (~12 hrs/week) → **~12 months**
**Started:** _(fill in)_   |   **Target finish:** _(fill in)_

---

## How to use this tracker

- Tick `[ ]` → `[x]` as you complete each item. Check off from your phone with the GitHub mobile app.
- **Progress by completion, not by calendar.** Months are guides, not deadlines.
- **Code along with everything.** ~25% watching/reading, ~75% hands-on.
- One block = one thread of one unit. Don't context-switch inside a 2-hr session.
- End each session with one line in the **Progress Log** at the bottom.
- Once a month, expand your log into a short LinkedIn/blog post → feeds the Career Track.

### Legend
- 🌳 **TRUNK** — mandatory backend/AI core, go deep
- ⚡ **SPIKE** — on-device/mobile moat, what makes you rare
- 🪟 **SURFACE** — web/demo, just enough to show your work

---

## 12-Month Calendar at a Glance

| Months | Phase | Hours | Milestone |
|--------|-------|-------|-----------|
| 1 – 2.5 | Phase 1: Foundations | ~105 | First trained model; Python + math + data solid |
| 2.5 – 4.5 | Phase 2: Transformers | ~90 | Built GPT from scratch; can read architecture code |
| 4.5 – 6 | Phase 3: Applied LLMs | ~65 | Fine-tuned a small model on your own dataset |
| 6 – 7.5 | Phase 4: AI Systems | ~65 | RAG + agents + web demo (backend trunk) |
| 7.5 – 9.5 | Phase 5: Deploy + On-Device | ~75 | Model running offline on a phone (the spike) |
| 9.5 – 12 | Phase 6: Capstones | ~100 | Two portfolio pieces: full-stack + on-device |

> By **month 6** you're already employable for some AI-application roles. The back half makes you *rare*.

---

## Unit 0 — Compute Setup (half a day, do first) 🌳

- [ ] Create Google Colab account (later: Colab Pro ~$10/mo when fine-tuning)
- [ ] Create Kaggle account (free GPU backup, datasets)
- [ ] Note RunPod / Lambda / Vast.ai as pay-per-hour GPU options for real fine-tuning
- [ ] Run a Colab notebook with GPU enabled; confirm `torch.cuda.is_available()` is `True`

---

## Phase 1 — Foundations 🌳  (Months 1 – 2.5, ~105 hrs)

### Unit 1 — Python + Math Intuition
- [ ] Read [Learn X in Y Minutes: Python](https://learnxinyminutes.com/python) (~2 hrs)
- [ ] `pip install numpy pandas matplotlib jupyter scikit-learn torch`
- [ ] Write 3 small scripts (list sorter, dict manipulator, simple class)
- [ ] [3Blue1Brown — Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab) ch. 1-5
- [ ] [3Blue1Brown — Essence of Calculus](https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr) ch. 1-4
- [ ] [StatQuest](https://www.youtube.com/c/joshstarmer): probability basics, distributions, cross-entropy
- [ ] [Andrew Ng — ML Specialization](https://www.coursera.org/specializations/machine-learning-introduction) Weeks 1-2 (free audit)
- **Done when:** environment works, gradient descent makes sense, matrix multiply is visual

### Unit 2 — NumPy + Neural Net by Hand
- [ ] [NumPy quickstart](https://numpy.org/doc/stable/user/quickstart.html)
- [ ] [Victor Zhou — Neural Network from scratch](https://victorzhou.com/blog/intro-to-neural-networks/)
- [ ] [3Blue1Brown — Neural Networks](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) (4 videos)
- **Done when:** working NN from scratch; can explain backprop

### Unit 3 — PyTorch
- [ ] [PyTorch 60-Minute Blitz](https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html)
- [ ] Rebuild your Unit 2 network in PyTorch
- [ ] Train an [MNIST classifier](https://pytorch.org/tutorials/beginner/basics/intro.html)
- **Done when:** comfortable with PyTorch + training loops

### Unit 4 — Classical ML + Data Skills 🌳
- [ ] [scikit-learn Getting Started](https://scikit-learn.org/stable/getting_started.html) + StatQuest (decision trees, train/test split, overfitting)
- [ ] Train one model on a tabular dataset (e.g. Titanic on Kaggle)
- [ ] Learn metrics: accuracy, precision, recall, F1, confusion matrix, ROC/AUC (StatQuest)
- [ ] Pandas: load → clean → EDA → proper train/val/test split
- **Done when:** messy CSV → clean dataset → trained model → honest evaluation

### Unit 5 — fast.ai *(OPTIONAL — skim or skip)*
- [ ] [fast.ai Practical Deep Learning](https://course.fast.ai/) Lesson 1 (skip if Unit 3 felt solid)

---

## Phase 2 — Deep Learning + Transformers 🌳  (Months 2.5 – 4.5, ~90 hrs)

> The hardest, densest phase. Push through it. Code along — every line.

### Unit 6 — Karpathy "Zero to Hero" (Part 1)
- [ ] [Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ) Video 1 (micrograd) — code along
- [ ] Video 2 (makemore) — code along
- [ ] Video 3 (makemore) — code along
- [ ] Video 4 (makemore) — code along
- **Done when:** running code for each; first text-generating model you trained

### Unit 7 — Build GPT + Transformer Paper
- [ ] Finish Karpathy playlist + [Let's build GPT from scratch](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- [ ] Read [Jay Alammar — The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [ ] Read [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [ ] *(Optional reference)* Sebastian Raschka — *Build a Large Language Model from Scratch* (book)
- **Done when:** a GPT you wrote yourself; can read transformer code

### Unit 8 — Evaluation Mindset
- [ ] Learn to read loss curves, use holdout sets, systematically eyeball outputs
- [ ] Browse [DeepLearning.AI short courses](https://www.deeplearning.ai/short-courses/) on evaluating LLMs

---

## Phase 3 — Applied LLMs 🌳  (Months 4.5 – 6, ~65 hrs)

### Unit 9 — Hugging Face + Running Models + Prompting
- [ ] [Hugging Face NLP/LLM Course](https://huggingface.co/learn/nlp-course) ch. 1-4
- [ ] Install [Ollama](https://ollama.com), run Llama/Mistral/Gemma/Phi locally
- [ ] [OpenAI prompting guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [ ] [Anthropic prompting guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [ ] Build: simple chatbot / Q&A tool with a HF model

### Unit 10 — Fine-Tuning
- [ ] [HF PEFT docs](https://huggingface.co/docs/peft) (LoRA / QLoRA)
- [ ] [Phil Schmid — Fine-tune LLMs with TRL](https://www.philschmid.de/fine-tune-llms-in-2024-with-trl)
- [ ] Build: fine-tune a **small** model (Gemma 2B / Phi-3-mini / Qwen 2.5) on YOUR cleaned dataset from Unit 4
- **Note:** small models = what runs on-device later. This directly feeds your spike.

### Unit 11 — Preference Tuning (DPO/RLHF) *(OPTIONAL)*
- [ ] Read [HF — Illustrating RLHF](https://huggingface.co/blog/rlhf)
- [ ] *(If time)* [TRL DPO trainer](https://huggingface.co/docs/trl/dpo_trainer) hands-on

---

## Phase 4 — AI Systems (backend trunk) 🌳  (Months 6 – 7.5, ~65 hrs)

### Unit 12 — RAG (build from scratch first)
- [ ] Build RAG with NO framework (embeddings + vector search + LLM call)
- [ ] Set up [ChromaDB](https://www.trychroma.com) locally
- [ ] Skim [LangChain concepts](https://python.langchain.com/docs/concepts/)
- [ ] *(Optional)* [DeepLearning.AI RAG short courses](https://www.deeplearning.ai/short-courses/)

### Unit 13 — Agents + Function Calling
- [ ] [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
- [ ] [Anthropic tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [ ] [Hugging Face Agents Course](https://huggingface.co/learn/agents-course)
- [ ] Build: PDF Q&A tool with citations
- [ ] Build: agent using 2+ tools (web search + calculator)

### Unit 14 — Web "just enough for demos" 🪟
- [ ] [Streamlit](https://streamlit.io) or [Gradio](https://www.gradio.app) — wrap an AI script as a web demo
- [ ] [FastAPI](https://fastapi.tiangolo.com) backend serving your model (doubles as real backend skill)

---

## Phase 5 — Deployment + ON-DEVICE (your spike) ⚡  (Months 7.5 – 9.5, ~75 hrs)

> The most strategically important section. ~99% of ML candidates can't put a model on a phone. You can.

### Unit 15 — Quantization 🌳⚡
- [ ] [llama.cpp](https://github.com/ggerganov/llama.cpp): convert + quantize a model to GGUF
- [ ] Understand INT4/INT8, and GGUF vs AWQ vs GPTQ tradeoffs

### Unit 16 — On-Device Inference ⚡ (the moat unit)
- [ ] [Google AI Edge / MediaPipe LLM Inference](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference) (Android/iOS/Flutter)
- [ ] [MLC-LLM](https://llm.mlc.ai/) (iOS/Android native, GPU)
- [ ] [ExecuTorch](https://pytorch.org/executorch/) (PyTorch on-device)
- [ ] [Core ML Tools](https://github.com/apple/coremltools) (iOS — your experience is an edge here)
- [ ] [ONNX Runtime Mobile](https://onnxruntime.ai/docs/tutorials/mobile/) / [TFLite / LiteRT](https://ai.google.dev/edge/litert)
- [ ] **Build:** quantized small model (Gemma 2B / Phi-3-mini) running OFFLINE inside a real mobile app

### Unit 17 — MLOps + Serving 🌳
- [ ] [Weights & Biases](https://wandb.ai) experiment tracking
- [ ] Model serving with FastAPI + Docker; skim [vLLM](https://github.com/vllm-project/vllm)
- [ ] *(Reference, read gradually)* Chip Huyen — *Designing Machine Learning Systems* (book)

---

## Phase 6 — Capstones (Months 9.5 – 12, ~100 hrs)

### Capstone A — Full-Stack AI Tool 🌳🪟
- [ ] Fine-tuned/prompted model + RAG + tool use + evaluation
- [ ] FastAPI backend + Streamlit/Flutter frontend
- [ ] Public GitHub repo + write-up
- **Proves:** you can build the whole stack

### Capstone B — On-Device AI App ⚡ (signature piece)
- [ ] Quantized, fine-tuned small model running FULLY OFFLINE in a Flutter/native app (no server)
- [ ] Public GitHub repo + demo video + write-up
- **Proves:** you're rare — a story no pure-ML or pure-mobile candidate can tell

---

## 🎯 Career Switch Track (runs in PARALLEL from Day 1)

- [ ] From Unit 1: every project → public GitHub repo with clean README
- [ ] From Unit 4: short write-up per project on LinkedIn/blog ("I built X, learned Y")
- [ ] ~Unit 9-10: reframe resume + LinkedIn around AI work
- [ ] ~Unit 12+: one open-source contribution (HF, llama.cpp, a tool you use)
- [ ] Phase 5-6: lead your narrative with the on-device spike
- [ ] Ongoing: engage community (HF forums, local AI meetups, AI X/Twitter)

---

## 📄 Paper Reading (start at Unit 7, ~1 per 2 units)

- [ ] [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [ ] [LoRA](https://arxiv.org/abs/2106.09685)
- [ ] [QLoRA](https://arxiv.org/abs/2305.14314)
- [ ] [Llama 2](https://arxiv.org/abs/2307.09288)
- [ ] [InstructGPT](https://arxiv.org/abs/2203.02155)
- [ ] Ongoing: 1 paper / 2 weeks via [arxiv-sanity-lite](https://arxiv-sanity-lite.com)

---

## The 6 Rules

1. Code along with every video. Watching is not learning.
2. One built project per phase, minimum.
3. Progress by completion (units), not by calendar.
4. Curated resources only — this list is enough. Don't go hunting for more.
5. Use mobile skills every phase; make on-device your signature.
6. Run the career track from Day 1. You'll never "feel ready" — start anyway.

### How to spend a 2-hour block
- One thread of one unit per block — no context-switching.
- ~30 min input, ~90 min hands-on.
- Code along (a 2-hr Karpathy video → 6-8 hrs with coding; that's correct).
- End with one line in the Progress Log.

### When you fall behind
- The calendar is a guide, not a contract. Slipping a week is normal; quitting is the only failure.
- Dragging on a unit usually means an earlier foundation gap — back up rather than push.
- The buffer is already built in. Use it without guilt.

---

## 📓 Progress Log

> One line per session: what I did / what confused me / where I stopped.

```
YYYY-MM-DD — 
YYYY-MM-DD — 
YYYY-MM-DD — 
```
