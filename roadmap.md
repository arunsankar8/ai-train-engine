# AI Engineering Roadmap — Full-Stack with On-Device Spike

**Profile:** 8 years mobile (Flutter / Android / iOS), zero ML background
**Goal:** Career switch to full-stack AI engineer with a rare on-device / mobile-AI specialty
**Target role:** AI/ML Application Engineer — building, fine-tuning, and shipping AI systems
**Pace:** 2 hrs/day × 6 days/week (~12 hrs/week) → **~12 months**
**Started:** _(23 June 2026)_   |   **Target finish:** _(fill in)_

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

### The strategy in one paragraph
You're going **T-shaped**: a broad, deep base in **backend + AI engineering** (the trunk — what every AI role needs), plus one **deep spike in on-device/mobile AI** (your moat — almost nobody can train/optimize a model *and* ship it on a phone). Web is just a **surface** to demo your work. The trunk makes you hireable; the spike makes you memorable.

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

**What you're doing & why:** Sorting out *where your code runs* before you need it. Most people stall at the fine-tuning stage because they never set this up — your laptop can't train models, but free cloud GPUs can. Solve it now so it never blocks you later.

- [ ] Create Google Colab account (later: Colab Pro ~$10/mo when fine-tuning)
  - *Your daily driver. Free GPUs in the browser; Pro gives better ones when you start fine-tuning.*
- [ ] Create Kaggle account (free GPU backup, datasets)
  - *30 free GPU hrs/week and a huge dataset library — your backup when Colab is busy.*
- [ ] Note RunPod / Lambda / Vast.ai as pay-per-hour GPU options
  - *For real fine-tuning later. A few dollars of A100 time saves days of frustration.*
- [ ] Run a Colab notebook with GPU enabled; confirm `torch.cuda.is_available()` is `True`
  - *Proves your setup works. If this returns True, you're ready for everything ahead.*

---

## Phase 1 — Foundations 🌳  (Months 1 – 2.5, ~105 hrs)

*Everything later collapses without this. Don't rush it — foundation gaps compound painfully.*

### Unit 1 — Python + Math Intuition
**What you're doing & why:** Picking up Python (trivial for you — it's simpler than Dart) and building *intuition* for the only math that matters: neural nets are matrix multiplications, and training is "follow the gradient downhill." You need to *see* these, not memorize formulas.

- [ ] Read [Learn X in Y Minutes: Python](https://learnxinyminutes.com/python) (~2 hrs)
  - *Written for people who already code. You'll recognize 80% from Dart.*
- [ ] `pip install numpy pandas matplotlib jupyter scikit-learn torch`
- [ ] Write 3 small scripts (list sorter, dict manipulator, simple class)
  - *Just enough to get Python in your fingers.*
- [ ] [3Blue1Brown — Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab) ch. 1-5
  - *See matrix multiplication geometrically — it's what every layer of a neural net does.*
- [ ] [3Blue1Brown — Essence of Calculus](https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr) ch. 1-4
  - *Understand gradients/derivatives — without this, training is a black box forever.*
- [ ] [StatQuest](https://www.youtube.com/c/joshstarmer): probability basics, distributions, cross-entropy
  - *The probability you'll need for softmax, sampling (temperature/top-k), and reading papers.*
- [ ] [Andrew Ng — ML Specialization](https://www.coursera.org/specializations/machine-learning-introduction) Weeks 1-2 (free audit)
  - *The clearest explanation anywhere of what "learning" means: loss functions + gradient descent.*
- **Done when:** environment works, gradient descent makes sense, matrix multiply is visual

### Unit 2 — NumPy + Neural Net by Hand
**What you're doing & why:** Building a neural network with *only* NumPy — no deep-learning library. This forces you to implement the forward pass, backprop, and weight updates yourself. People who skip this treat training as magic for the rest of their careers. You won't.

- [ ] [NumPy quickstart](https://numpy.org/doc/stable/user/quickstart.html)
  - *PyTorch tensors are almost identical to NumPy arrays — learn this first and PyTorch clicks instantly.*
- [ ] [Victor Zhou — Neural Network from scratch](https://victorzhou.com/blog/intro-to-neural-networks/)
  - *A 2-layer net by hand. The single best way to truly understand backprop at the code level.*
- [ ] [3Blue1Brown — Neural Networks](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) (4 videos)
  - *The visual companion to the coding exercise above — watch them together.*
- **Done when:** working NN from scratch; can explain backprop out loud

### Unit 3 — PyTorch
**What you're doing & why:** Learning the library every AI job and research paper uses. After Unit 2, this is easy — you're just seeing the polished version of what you already built by hand. You'll also train your first "real" model on a real dataset.

- [ ] [PyTorch 60-Minute Blitz](https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html)
  - *The official intro. Everything will feel familiar after Unit 2.*
- [ ] Rebuild your Unit 2 network in PyTorch
  - *Same network, library version — cements how PyTorch maps to the math.*
- [ ] Train an [MNIST classifier](https://pytorch.org/tutorials/beginner/basics/intro.html)
  - *The "hello world" of ML. Real training loop, real evaluation. Every practitioner has done this.*
- **Done when:** comfortable with PyTorch + training loops

### Unit 4 — Classical ML + Data Skills 🌳
**What you're doing & why:** Two things the LLM hype skips but that real jobs demand: (1) classical ML + metrics (interviews and tabular problems still need these), and (2) **data skills** — because when you fine-tune later, *dataset quality is the entire job*. Learning to build a clean dataset now pays off massively in Unit 10.

- [ ] [scikit-learn Getting Started](https://scikit-learn.org/stable/getting_started.html) + StatQuest (decision trees, train/test split, overfitting)
  - *The classical-ML toolkit. Fast to learn, still widely used, expected in interviews.*
- [ ] Train one model on a tabular dataset — [Kaggle Titanic](https://www.kaggle.com/c/titanic) (has a built-in beginner notebook + tutorials)
  - *Your first end-to-end "predict something from a spreadsheet" project.*
- [ ] Learn metrics: accuracy, precision, recall, F1, confusion matrix, ROC/AUC (StatQuest)
  - *You literally cannot tell if a model is "good" without these. Non-negotiable.*
- [ ] Pandas: load → clean → EDA → proper train/val/test split
  - *The unglamorous skill that separates working ML from broken ML.*
- [ ] *(Small project)* Implement linear & logistic regression from scratch (no sklearn), add L1/L2 regularization
  - *No new resource needed — reuse your Unit 2 NumPy skills + Andrew Ng's math from Unit 1. Logistic regression is literally a 1-layer neural net.*
- **Done when:** messy CSV → clean dataset → trained model → honest evaluation

### Unit 5 — fast.ai *(OPTIONAL — skim or skip)*
**What you're doing & why:** A top-down taste of how powerful high-level tools have become (Lesson 1 trains a strong classifier in ~5 lines). Optional because it overlaps Units 3-4 and uses its own library. Skip if Unit 3 felt solid.

- [ ] [fast.ai Practical Deep Learning](https://course.fast.ai/) Lesson 1 (skip if Unit 3 felt solid)

---

## Phase 2 — Deep Learning + Transformers 🌳  (Months 2.5 – 4.5, ~90 hrs)

*The hardest, densest phase — and the one that delivers your "read and reverse-engineer model code" goal. Push through it. Code along, every line.*

### Unit 6 — Karpathy "Zero to Hero" (Part 1)
**What you're doing & why:** Following Andrej Karpathy (ex-Tesla AI head, ex-OpenAI) as he builds from a single neuron up to a language model, line by line. This series is the most valuable free AI education that exists. Video 1 makes you understand exactly what PyTorch's autograd does internally; videos 2-4 produce your first model that generates text you trained.

- [ ] [Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ) Video 1 (micrograd) — code along
  - *Builds an autograd engine from scratch — the heart of how all training works.*
- [ ] Video 2 (makemore) — code along
- [ ] Video 3 (makemore) — code along
- [ ] Video 4 (makemore) — code along
  - *Builds character-level language models — your first taste of generating text from a model you wrote.*
- **Done when:** running code for each; first text-generating model you trained

### Unit 7 — Build GPT + Transformer Paper
**What you're doing & why:** Building a GPT in ~300 lines of Python with Karpathy, then reading the paper behind it. By the end you'll have *implemented a transformer* — which is the exact skill you wanted: looking at model architecture code and understanding (and modifying) it.

- [ ] Finish Karpathy playlist + [Let's build GPT from scratch](https://www.youtube.com/watch?v=kCc8FmEb1nY)
  - *GPT, from nothing, in one sitting. This is the reverse-engineering ability you asked for.*
- [ ] Read [Jay Alammar — The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
  - *Read this BEFORE the paper — the best visual explanation of attention; it makes the paper readable.*
- [ ] Read [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
  - *The 2017 paper behind GPT, Llama, Claude — everything. Read for architecture decisions, not every equation.*
- [ ] *(Optional reference)* Sebastian Raschka — *Build a Large Language Model from Scratch* (book)
  - *If you want the from-scratch GPT in book form with exercises — the best companion to Karpathy.*
- **Done when:** a GPT you wrote yourself; can read transformer code

### Unit 8 — Evaluation Mindset
**What you're doing & why:** Learning to *measure* whether a model is actually good — early, before you start fine-tuning. Deploying or fine-tuning without evaluation is just guessing. You don't need the full MLOps eval stack yet; you need the habit now.

- [ ] Learn to read loss curves, use holdout sets, systematically eyeball outputs
  - *The minimum discipline to know if your training worked or you fooled yourself.*
- [ ] Read the [Hugging Face Evaluation Guidebook](https://github.com/huggingface/evaluation-guidebook)
  - *The best free, practical resource on evaluating LLMs — your concrete anchor for this unit.*
- [ ] Browse [DeepLearning.AI short courses](https://www.deeplearning.ai/short-courses/) on evaluating LLMs
  - *Bite-sized, practical, made with the actual tool vendors.*
- [ ] Know the standard benchmarks (MMLU, HumanEval, MT-Bench, AlpacaEval) + the "LLM-as-judge" technique (concept level)
  - *"How do you know it's good?" comes up in real work AND interviews. Awareness only — no need to run them all now.*

---

## Phase 3 — Applied LLMs 🌳  (Months 4.5 – 6, ~65 hrs)

### Unit 9 — Hugging Face + Running Models + Prompting
**What you're doing & why:** Learning the practical layer that sits on top of everything you've built. Hugging Face is "the npm of AI" — where all open models live. You'll also run models locally (zero API cost) and learn prompting, which you'll use every single day building AI tools.

- [ ] [Hugging Face NLP/LLM Course](https://huggingface.co/learn/nlp-course) ch. 1-4
  - *Tokenizers, pipelines, the Transformers library — the day-to-day toolkit of an AI engineer.*
- [ ] Install [Ollama](https://ollama.com), run Llama/Mistral/Gemma/Phi locally
  - *See the inference side firsthand; experiment freely without paying per API call.*
- [ ] [OpenAI prompting guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [ ] [Anthropic prompting guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
  - *Chain-of-thought, few-shot, structured output — these dramatically improve model results.*
- [ ] Decoding strategies: greedy, beam, temperature, top-k, top-p (nucleus), repetition/frequency penalties — [HF "How to generate text"](https://huggingface.co/blog/how-to-generate)
  - *Daily-use knowledge for any LLM tool — this is how you control what the model generates. ~half a day, huge payoff.*
- [ ] Chat templates & multi-turn formatting (ChatML/Alpaca, system prompts, special tokens, loss masking) — [HF chat templating docs](https://huggingface.co/docs/transformers/main/en/chat_templating)
  - *Needed to build chat tools AND to format fine-tuning data correctly (feeds Unit 10).*
- [ ] *(Optional small project)* Build a tiny BPE tokenizer from scratch — [Karpathy: "Let's build the GPT Tokenizer"](https://www.youtube.com/watch?v=zduSFxRajkE)
  - *Karpathy's dedicated tokenizer video is the perfect guide. Small and illuminating — demystifies how text becomes tokens. Skip if short on time.*
- [ ] Build: simple chatbot / Q&A tool with a HF model
  - *Your first applied LLM project — and a portfolio piece.*

### Unit 10 — Fine-Tuning
**What you're doing & why:** Specializing a pretrained model for a specific task using LoRA/QLoRA — efficient methods that run on modest GPUs. This is your "tune a model to work under specific conditions" goal. You deliberately fine-tune a *small* model, because small models are exactly what runs on-device in Phase 5.

- [ ] [HF PEFT docs](https://huggingface.co/docs/peft) (LoRA / QLoRA)
  - *How real production fine-tuning works without massive hardware.*
- [ ] [Phil Schmid — Fine-tune LLMs with TRL](https://www.philschmid.de/fine-tune-llms-in-2024-with-trl)
  - *The clearest end-to-end fine-tuning guide; the author works at Hugging Face.*
- [ ] Build: fine-tune a **small** model (Gemma 2B / Phi-3-mini / Qwen 2.5) on YOUR cleaned dataset from Unit 4
  - *100 good examples beats 1000 messy ones. This is where Unit 4's data skills pay off.*
- **Note:** small models = what runs on-device later. This directly feeds your spike.

### Unit 11 — Preference Tuning (DPO/RLHF) *(OPTIONAL)*
**What you're doing & why:** Understanding how raw models become *well-behaved assistants* — fine-tuning teaches what to say, preference tuning teaches how to behave. Valuable knowledge, but lower priority than RAG/agents for a tool-builder, so it's optional. Read the concept; do the hands-on only if you have time.

- [ ] Read [HF — Illustrating RLHF](https://huggingface.co/blog/rlhf)
- [ ] *(If time)* [TRL DPO trainer](https://huggingface.co/docs/trl/dpo_trainer) hands-on

---

## Phase 4 — AI Systems (backend trunk) 🌳  (Months 6 – 7.5, ~65 hrs)

*Your 8 years of engineering starts dominating here. This phase is the backend trunk — the part of AI work that's the most jobs.*

### Unit 12 — RAG (build from scratch first)
**What you're doing & why:** Building Retrieval-Augmented Generation — how you give a model access to *your* documents/knowledge. You build it from scratch first so you're never dependent on a framework you don't understand. RAG is the backbone of most real-world AI products.

- [ ] Understand embeddings (text → semantic vectors) — [Sentence Transformers docs](https://www.sbert.net/) (the HF course covers this too)
  - *The concept RAG is built on: similar meaning = nearby vectors. Don't enter RAG without this clicking.*
- [ ] Build RAG with NO framework (embeddings + vector search + LLM call)
  - *Understand the machinery before reaching for abstractions.*
- [ ] Set up [ChromaDB](https://www.trychroma.com) locally
  - *A vector database — where embeddings live and get searched.*
- [ ] Skim [LangChain concepts](https://python.langchain.com/docs/concepts/)
  - *Understand the popular framework's ideas — but you'll know what's happening underneath.*
- [ ] *(Optional)* [DeepLearning.AI RAG short courses](https://www.deeplearning.ai/short-courses/)

### Unit 13 — Agents + Function Calling
**What you're doing & why:** Learning how a model *decides to use tools* — the mechanics behind assistants like the one helping you now. This is the core of building "an AI tool like Kiro": a model that can call functions, use results, and act in a loop.

- [ ] [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
- [ ] [Anthropic tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
  - *The exact mechanism by which models call tools and handle results.*
- [ ] [Hugging Face Agents Course](https://huggingface.co/learn/agents-course)
  - *Free, current, hands-on agent building — newer than most agent material out there.*
- [ ] Build: PDF Q&A tool with citations
- [ ] Build: agent using 2+ tools (web search + calculator)
  - *Two portfolio projects that prove you can build real AI systems, not just call APIs.*

### Unit 14 — Web "just enough for demos" 🪟
**What you're doing & why:** Web is a *presentation surface*, not a specialty to master. Spend minimum time for maximum payoff — just enough to turn your AI work into something people can click and a backend you can serve from.

- [ ] [Streamlit](https://streamlit.io) or [Gradio](https://www.gradio.app) — wrap an AI script as a web demo
  - *Turns any script into a shareable web app in ~20 lines. How ML people ship demos.*
- [ ] [FastAPI](https://fastapi.tiangolo.com) backend serving your model
  - *Doubles as a real backend skill, not throwaway — you'll reuse this in the capstone.*

---

## Phase 5 — Deployment + ON-DEVICE (your spike) ⚡  (Months 7.5 – 9.5, ~75 hrs)

*The most strategically important section. ~99% of ML candidates can't put a model on a phone. You can — this is your entire competitive edge.*

### Unit 15 — Quantization 🌳⚡
**What you're doing & why:** Shrinking models so they run on small hardware (and phones). You'll see formats like GGUF/AWQ/GPTQ everywhere — knowing what they mean means you're not blindly downloading files, and it's the prerequisite for on-device inference.

- [ ] [llama.cpp](https://github.com/ggerganov/llama.cpp): convert + quantize a model to GGUF
  - *The standard tool for compressing models to run on normal/edge hardware.*
- [ ] Understand INT4/INT8, and GGUF vs AWQ vs GPTQ tradeoffs
  - *The vocabulary of model compression — you'll use it constantly.*

### Unit 16 — On-Device Inference ⚡ (the moat unit)
**What you're doing & why:** THIS is your differentiator. Running a model directly on a phone, offline. Almost no ML engineer can do this, and almost no mobile dev can train/optimize the model — you'll be one of the few who does both. Your iOS/Android/Flutter experience is a direct, rare advantage here.

- [ ] [Google AI Edge / MediaPipe LLM Inference](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference) (Android/iOS/Flutter)
  - *Your most direct route — Flutter-friendly, runs Gemma/Phi on-device.*
- [ ] [MLC-LLM](https://llm.mlc.ai/) (iOS/Android native, GPU)
  - *Compiles LLMs to run natively on phone GPUs — cutting-edge on-device.*
- [ ] [ExecuTorch](https://pytorch.org/executorch/) (PyTorch on-device)
  - *PyTorch's official on-device runtime — a straight line from training to phone.*
- [ ] [Core ML Tools](https://github.com/apple/coremltools) (iOS — your experience is an edge here)
  - *Convert models to Core ML — your iOS background makes this familiar territory.*
- [ ] [ONNX Runtime Mobile](https://onnxruntime.ai/docs/tutorials/mobile/) / [TFLite / LiteRT](https://ai.google.dev/edge/litert)
  - *The classic cross-platform on-device runtimes.*
- [ ] **Build:** quantized small model (Gemma 2B / Phi-3-mini) running OFFLINE inside a real mobile app
  - *The single highest-value portfolio piece in this whole roadmap.*

### Unit 17 — MLOps + Serving 🌳
**What you're doing & why:** The engineering around models — tracking experiments, serving via an API, and measuring quality. This is what separates "hacking" from production AI engineering.

- [ ] [Weights & Biases](https://wandb.ai) experiment tracking
  - *Industry-standard tracking — every serious ML project uses something like it.*
- [ ] Model serving with FastAPI + Docker; skim [vLLM](https://github.com/vllm-project/vllm)
  - *How models get served at scale. Know vLLM exists; don't sink days unless a project needs it.*
- [ ] KV cache — understand the *concept* (what it caches, why it speeds inference, why it costs memory)
  - *Concept only — don't implement PagedAttention. Directly relevant to your on-device spike: KV cache memory is a real constraint on a phone.*
- [ ] *(Reference, read gradually)* Chip Huyen — *Designing Machine Learning Systems* (book)
  - *The industry-standard book on real ML systems — what senior AI engineers are expected to know.*

---

## Phase 6 — Capstones (Months 9.5 – 12, ~100 hrs)

*Two capstones tell a story no pure-ML and no pure-mobile candidate can tell. A gets you in the door; B makes you unforgettable.*

### Capstone A — Full-Stack AI Tool 🌳🪟
**Proves you can build the whole stack.**
- [ ] Fine-tuned/prompted model + RAG + tool use + evaluation
- [ ] FastAPI backend + Streamlit/Flutter frontend
- [ ] Public GitHub repo + write-up

### Capstone B — On-Device AI App ⚡ (signature piece)
**Proves you're rare.**
- [ ] Quantized, fine-tuned small model running FULLY OFFLINE in a Flutter/native app (no server)
- [ ] Public GitHub repo + demo video + write-up

---

## 🎯 Career Switch Track (runs in PARALLEL from Day 1)

*A switch is won through visible proof and network, not a finished curriculum. Don't save this for the end.*

- [ ] From Unit 1: every project → public GitHub repo with clean README
  - *Demonstrated work beats certificates for career switchers.*
- [ ] From Unit 4: short write-up per project on LinkedIn/blog ("I built X, learned Y")
  - *Visibility creates inbound opportunities and proves you can communicate.*
- [ ] ~Unit 9-10: reframe resume + LinkedIn around AI work
  - *By now you have 2-3 projects — enough to reposition yourself.*
- [ ] ~Unit 12+: one open-source contribution (HF, llama.cpp, a tool you use)
  - *Network + credibility + real-world code.*
- [ ] Phase 5-6: lead your narrative with the on-device spike
  - *"AI engineer who ships models to phones, offline" — a scarce, memorable pitch.*
- [ ] Ongoing: engage community (HF forums, local AI meetups, AI X/Twitter)
  - *Most switch roles come through network, not cold applications.*
- [ ] ~Month 10-11: interview prep — practice explaining core concepts out loud (attention, backprop, fine-tuning) + skim ML system design framing
  - *You're switching careers — clearly explaining what you built is half the battle. A couple of weeks near job-hunt time; don't over-invest.*

---

## 📄 Paper Reading (start at Unit 7, ~1 per 2 units)

*Your "reverse-engineer models" goal requires reading papers. Start with short, directly-relevant ones.*

- [ ] [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — *the foundation of all modern LLMs*
- [ ] [LoRA](https://arxiv.org/abs/2106.09685) — *short, practical, you'll use it immediately*
- [ ] [QLoRA](https://arxiv.org/abs/2305.14314) — *LoRA + quantization; directly relevant to your small-model/on-device path*
- [ ] [Llama 2](https://arxiv.org/abs/2307.09288) — *architecture decisions in a real production model*
- [ ] [InstructGPT](https://arxiv.org/abs/2203.02155) — *how RLHF made GPT actually useful*
- [ ] Ongoing: 1 paper / 2 weeks via [arxiv-sanity-lite](https://arxiv-sanity-lite.com) — *build paper-reading fluency, stay current*

---

## 📚 Reference Shelf (zero-overhead — lookup material, not tasks)

Use these when a concept won't click or you want a second explanation. Don't "study" them cover to cover.

- [Lil'Log (Lilian Weng)](https://lilianweng.github.io/) — the best concise technical summaries anywhere; your go-to when stuck
- [nanoGPT (Karpathy)](https://github.com/karpathy/nanoGPT) — clean minimal GPT; pairs perfectly with Unit 7
- [d2l.ai — Dive into Deep Learning](https://d2l.ai/) — free interactive book; great for a different explanation of a topic
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) — (also in Unit 7) the clearest visual on attention
- *(Optional deep dive, only later)* Stanford CS224n (NLP) — a full course; reference depth, not a requirement

---

## On doing EXTRA projects (read before you go hunting for more)

Your roadmap already embeds the projects that matter — neural net from scratch (Unit 2), a GPT (Unit 7), a fine-tune (Unit 10), RAG + an agent (Units 12-13), on-device inference (Unit 16), and two capstones. **You are not missing important projects.**

- **Don't** redo parallel versions of these just because another curriculum lists them — that's duplication, not progress.
- **Do** the small reinforcing ones folded in above (regression from scratch in Unit 4, optional BPE tokenizer in Unit 9) — cheap, locks in fundamentals.
- **Save for AFTER the 12 months** (and only if you go deeper toward research): training a model from scratch beyond Karpathy, training a 1B model, MoE, distributed training, RLHF/PPO from scratch, multimodal, Mamba. Research-track, need expensive multi-GPU hardware, not used by AI product/on-device engineers.

**Rule of thumb:** a project is worth doing if it (a) reinforces a fundamental cheaply, or (b) becomes a portfolio piece that proves you're an AI engineer with an on-device edge. If it does neither, skip it.

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
- Code along (a 2-hr Karpathy video → 6-8 hrs with coding; that's correct and expected).
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
