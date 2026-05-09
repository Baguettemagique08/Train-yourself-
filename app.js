(() => {
  const toggle = document.getElementById('caveman-toggle');
  const transformBtn = document.getElementById('transform-btn');
  const copyBtn = document.getElementById('copy-btn');
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const outputLabel = document.getElementById('output-label');
  const banner = document.getElementById('caveman-banner');
  const app = document.querySelector('.app');

  let cavemanActive = false;

  toggle.addEventListener('change', () => {
    cavemanActive = toggle.checked;
    if (cavemanActive) {
      app.classList.add('caveman-mode');
      banner.classList.remove('hidden');
      outputLabel.textContent = 'UGH OUTPUT';
      transformBtn.textContent = 'UGH TRANSFORM';
      inputText.placeholder = 'ME TYPE HERE...';
    } else {
      app.classList.remove('caveman-mode');
      banner.classList.add('hidden');
      outputLabel.textContent = 'Output';
      transformBtn.textContent = 'Transform';
      inputText.placeholder = 'Type something here...';
    }
    outputText.textContent = 'Output appears here...';
  });

  transformBtn.addEventListener('click', () => {
    const raw = inputText.value.trim();
    if (!raw) {
      outputText.textContent = cavemanActive ? 'ME NEED INPUT. TYPE NOW.' : 'Nothing to transform.';
      return;
    }
    outputText.textContent = cavemanActive ? CavemanMode.transform(raw) : raw;
  });

  copyBtn.addEventListener('click', () => {
    const content = outputText.textContent;
    if (!content || content === 'Output appears here...') return;
    navigator.clipboard.writeText(content).then(() => {
      copyBtn.textContent = cavemanActive ? 'COPIED UGH' : 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = cavemanActive ? 'UGH COPY' : 'Copy';
      }, 1500);
    });
  });
})();
