import { useState } from 'react';

const initialDetails = {
  name: '',
  email: '',
  phone: '',
  location: '',
  role: '',
  summary: '',
  jobTitle: '',
  company: '',
  dates: '',
  experience: '',
  degree: '',
  school: '',
  educationDates: '',
  skills: '',
};

function makeDraft(details) {
  const lines = [details.name.trim() || 'Your Name'];
  const contact = [details.email, details.phone, details.location].filter(Boolean);
  if (contact.length) lines.push(contact.join(' | '));
  if (details.role.trim()) lines.push(`TARGET ROLE: ${details.role.trim()}`);

  if (details.summary.trim()) {
    lines.push('', 'PROFESSIONAL SUMMARY', details.summary.trim());
  }

  if (details.jobTitle.trim() || details.company.trim() || details.experience.trim()) {
    lines.push('', 'EXPERIENCE');
    const position = [details.jobTitle, details.company].filter(Boolean).join(' | ');
    if (position) lines.push(position);
    if (details.dates.trim()) lines.push(details.dates.trim());
    if (details.experience.trim()) lines.push(...details.experience.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => line.startsWith('- ') ? line : `- ${line}`));
  }

  if (details.degree.trim() || details.school.trim()) {
    lines.push('', 'EDUCATION');
    const education = [details.degree, details.school].filter(Boolean).join(' | ');
    if (education) lines.push(education);
    if (details.educationDates.trim()) lines.push(details.educationDates.trim());
  }

  if (details.skills.trim()) {
    lines.push('', 'SKILLS', details.skills.split(',').map((skill) => skill.trim()).filter(Boolean).join('  |  '));
  }

  return lines.join('\n');
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline = false, rows = 3, fieldId }) {
  const id = fieldId || label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const commonProps = {
    id,
    name: id,
    value,
    onChange: (event) => onChange(event.target.value),
    placeholder,
  };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea {...commonProps} rows={rows} /> : <input {...commonProps} type={type} />}
    </div>
  );
}

export default function App() {
  const [details, setDetails] = useState(initialDetails);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');

  function updateDetail(key, value) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  function generateDraft(event) {
    event.preventDefault();
    if (!details.name.trim() && !details.role.trim() && !details.experience.trim()) {
      setNotice('Add your name, target role, or experience to create a draft.');
      return;
    }
    setDraft(makeDraft(details));
    setNotice('Local draft ready. Review every detail before using it.');
  }

  async function copyDraft() {
    if (!draft) {
      setNotice('Create a draft before copying.');
      return;
    }
    try {
      await navigator.clipboard.writeText(draft);
      setNotice('ATS-friendly text copied to clipboard.');
    } catch {
      setNotice('Clipboard access was blocked. Select and copy the draft manually.');
    }
  }

  async function downloadPdf() {
    if (!draft) {
      setNotice('Create a draft before downloading a PDF.');
      return;
    }
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
    const margin = 48;
    const width = pdf.internal.pageSize.getWidth() - margin * 2;
    const lines = pdf.splitTextToSize(draft, width);
    let y = margin;
    lines.forEach((line) => {
      if (y > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 16;
    });
    const filename = (details.name.trim() || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    pdf.save(`${filename || 'resume'}.pdf`);
    setNotice('PDF downloaded. Check the file before sending it.');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Draftroom home"><span className="wordmark-mark">D</span>draftroom</a>
        <div className="topbar-meta"><span className="status-dot" /> Your work stays in this browser</div>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow">A clearer next step</p>
          <h1>Make your experience<br /><em>easy to see.</em></h1>
          <p className="intro-description">Shape your story into a clean, ATS-friendly resume. Start with what you know; refine every line before it leaves your hands.</p>
        </div>
        <div className="intro-note"><span className="note-index">01 / 02</span><span>Build your draft<br />Review. Refine. Download.</span></div>
      </section>

      <div className="workspace">
        <form className="details-panel" onSubmit={generateDraft}>
          <div className="panel-heading">
            <div><p className="eyebrow">Your details</p><h2>Start with the facts</h2></div>
            <span className="step-number">01</span>
          </div>

          <section className="form-section">
            <h3>Contact & direction</h3>
            <div className="field-grid">
              <Field label="Full name" value={details.name} onChange={(value) => updateDetail('name', value)} placeholder="Jordan Lee" />
              <Field label="Target role" value={details.role} onChange={(value) => updateDetail('role', value)} placeholder="Product designer" />
              <Field label="Email" type="email" value={details.email} onChange={(value) => updateDetail('email', value)} placeholder="jordan@email.com" />
              <Field label="Phone" value={details.phone} onChange={(value) => updateDetail('phone', value)} placeholder="+1 555 010 2040" />
              <Field label="Location" value={details.location} onChange={(value) => updateDetail('location', value)} placeholder="Austin, TX" />
            </div>
          </section>

          <section className="form-section">
            <h3>Profile</h3>
            <Field label="Professional summary" value={details.summary} onChange={(value) => updateDetail('summary', value)} placeholder="A short introduction using your real strengths and experience." multiline rows={4} />
          </section>

          <section className="form-section">
            <h3>Experience</h3>
            <div className="field-grid">
              <Field label="Job title" value={details.jobTitle} onChange={(value) => updateDetail('jobTitle', value)} placeholder="Software engineer" />
              <Field label="Company" value={details.company} onChange={(value) => updateDetail('company', value)} placeholder="Company name" />
              <Field label="Dates" fieldId="experience-dates" value={details.dates} onChange={(value) => updateDetail('dates', value)} placeholder="2023 – Present" />
            </div>
            <div className="field-spacer"><Field label="What you did" value={details.experience} onChange={(value) => updateDetail('experience', value)} placeholder={'One achievement or responsibility per line.\nUse specific, verifiable details.'} multiline rows={5} /></div>
          </section>

          <section className="form-section">
            <h3>Education & skills</h3>
            <div className="field-grid">
              <Field label="Degree or program" value={details.degree} onChange={(value) => updateDetail('degree', value)} placeholder="B.S. Computer Science" />
              <Field label="School" value={details.school} onChange={(value) => updateDetail('school', value)} placeholder="University name" />
              <Field label="Dates" fieldId="education-dates" value={details.educationDates} onChange={(value) => updateDetail('educationDates', value)} placeholder="2019 – 2023" />
            </div>
            <div className="field-spacer"><Field label="Skills" value={details.skills} onChange={(value) => updateDetail('skills', value)} placeholder="Python, SQL, cloud computing" /></div>
          </section>

          <button className="primary-button generate-button" type="submit"><span>Build resume draft</span><span aria-hidden="true">↗</span></button>
          <p className="privacy-caption">Local demo mode: no AI service is connected and nothing is sent anywhere.</p>
        </form>

        <section className="preview-panel" aria-labelledby="preview-heading">
          <div className="preview-toolbar">
            <div><p className="eyebrow">Live document</p><h2 id="preview-heading">Your resume</h2></div>
            <span className="ats-label"><span className="status-dot" /> ATS-ready text</span>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          <div className="paper-wrap">
            {draft ? (
              <textarea className="resume-editor" aria-label="Editable resume draft" value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck="false" />
            ) : (
              <div className="empty-paper">
                <span className="empty-mark" aria-hidden="true">R</span>
                <p className="empty-title">Your next chapter<br />starts here.</p>
                <p className="empty-copy">Add your details on the left, then build a draft. Your resume will appear here, ready for you to edit.</p>
                <span className="paper-rule" />
                <span className="paper-line wide" /><span className="paper-line" /><span className="paper-line short" />
              </div>
            )}
          </div>
          <div className="preview-actions">
            <button className="secondary-button" type="button" onClick={copyDraft}><span aria-hidden="true">▣</span> Copy ATS text</button>
            <button className="primary-button download-button" type="button" onClick={downloadPdf}><span>Download PDF</span><span aria-hidden="true">↓</span></button>
          </div>
          <p className="review-reminder">AI-ready structure, human-reviewed content. Always verify names, dates, and claims.</p>
        </section>
      </div>
      <footer className="footer"><span>Draftroom <span className="footer-divider">/</span> Resume builder</span><span>Made for the work ahead.</span></footer>
    </main>
  );
}