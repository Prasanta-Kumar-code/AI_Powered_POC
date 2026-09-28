# Example AI Prompts

Use user-provided facts only. Ask the model not to invent employers, dates, credentials, metrics, or skills. The user must review every result before using it.

## Software Engineer Resume

> Generate a professional, ATS-friendly resume for a software engineer with 2 years of Python experience and cloud computing skills. Use clear section headings and concise achievement-focused bullets. Do not invent employers, dates, certifications, projects, or metrics. Mark missing details as questions for the user. Tailor the wording to this target role: [target role]. Here are the candidate's verified details: [candidate details]. Return plain text.

## LinkedIn About Section

> Create a LinkedIn About section for a marketing graduate with internship experience in social media campaigns. Keep the tone professional and approachable, use only the verified facts provided, and do not invent results or metrics. Target roles: [target roles]. Candidate details: [candidate details]. Return one concise first-person draft.

## General Resume Draft

```text
Create an ATS-friendly resume draft for the target role below.
Use only the candidate facts supplied. Never fabricate employers, dates,
education, skills, certifications, or quantified outcomes. If information is
missing, leave a clear placeholder or ask a question. Use standard headings,
plain text, and concise bullets. Return the draft for human review.

Target role: {{target_role}}
Candidate facts: {{candidate_facts}}
```