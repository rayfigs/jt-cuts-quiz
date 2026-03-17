// JT Cuts Academy — Quiz Funnel Engine
// QFMC-compliant: Branching logic, 5-bucket routing, lead capture, outcome display

(function() {
  'use strict';

  // ============ CONFIGURATION ============
  const HOOKS = {
    blindspot: "What's Your #1 Career Path Blind Spot?",
    score: "What's Your Career Readiness Score?",
    type: "Which Career Launch Type Are You?",
    holdback: "Which Career Choices Are Limiting Your Income Potential?"
  };

  const BUCKETS = {
    1: { code: 'I.C.', name: 'The Invisible Ceiling' },
    2: { code: 'C.T.', name: 'The Clock Trap' },
    3: { code: 'S.I.', name: 'The Security Illusion' },
    4: { code: 'L.L.', name: 'The Legitimacy Lock' },
    5: { code: 'S.S.', name: 'The Survival Spiral' }
  };

  // ============ STATE ============
  let state = {
    hook: 'blindspot',
    src: 'direct',
    perspective: null, // 'self' or 'other'
    answers: {},
    bucket: null,
    currentQuestion: 1,
    totalQuestions: 7
  };

  // ============ QUESTIONS (with branching) ============
  function getQuestions() {
    const isSelf = state.perspective === 'self';

    return {
      1: {
        number: 'Question 1 of 7',
        text: 'Who is this quiz for?',
        options: [
          { label: 'Me — I\'m exploring career options for myself', value: 'self' },
          { label: 'Someone I care about — I\'m researching options for them', value: 'other' }
        ]
      },
      2: {
        number: 'Question 2 of 7',
        text: isSelf
          ? 'When you think about your career path right now, what\'s the first feeling that comes up?'
          : 'When you think about their future, what\'s the strongest feeling that comes up?',
        options: isSelf
          ? [
              { label: 'Pressure — too many opinions, not enough clarity', value: 'pressure' },
              { label: 'Frustrated — I know something needs to change but I\'m not sure how', value: 'frustrated' },
              { label: 'Anxious — I\'m worried about making the wrong choice', value: 'anxious' },
              { label: 'Determined — I\'m ready to move, I just need the right direction', value: 'determined' }
            ]
          : [
              { label: 'Worried — I don\'t want them to make a costly mistake', value: 'worried' },
              { label: 'Uncertain — I\'m not sure what the best path is for them', value: 'uncertain' },
              { label: 'Hopeful — I think they have potential, I just want them on the right track', value: 'hopeful' },
              { label: 'Urgent — they need direction and they need it soon', value: 'urgent' }
            ]
      },
      3: {
        number: 'Question 3 of 7',
        text: isSelf
          ? 'Which best describes your current situation?'
          : 'Which best describes the person you\'re researching for?',
        options: isSelf
          ? [
              { label: 'I\'m a student or young adult figuring out my next move', value: 'student' },
              { label: 'I\'m already cutting hair or doing beauty work (with or without a license)', value: 'barber' },
              { label: 'I\'m working but looking for a better career path', value: 'worker' },
              { label: 'I\'m in between — unemployed, laid off, or in transition', value: 'transition' }
            ]
          : [
              { label: 'They\'re a student or young adult figuring out their next move', value: 'student' },
              { label: 'They\'re already cutting hair or doing beauty work (with or without a license)', value: 'barber' },
              { label: 'They\'re working but could use a better career path', value: 'worker' },
              { label: 'They\'re in between — unemployed, in transition, or need a fresh start', value: 'transition' }
            ]
      },
      4: {
        number: 'Question 4 of 7',
        text: isSelf
          ? 'If you had to pick one, what feels like the biggest thing standing between you and a more profitable career right now?'
          : 'What feels like the biggest thing standing between them and a more profitable career right now?',
        options: isSelf
          ? [
              { label: 'I\'ve been told I need a degree to have a "real" career', value: '1' },
              { label: 'I don\'t have years (or the money) to invest before I can start earning', value: '2' },
              { label: 'I\'m worried my current path isn\'t as secure as it seems — AI, layoffs, burnout', value: '3' },
              { label: 'I already have skills and clients but I need the license and structure to grow', value: '4' },
              { label: 'I need to start earning more money NOW — I can\'t wait years', value: '5' }
            ]
          : [
              { label: 'Everyone assumes they need a degree to have a "real" career', value: '1' },
              { label: 'They don\'t have years (or the money) to invest before they can start earning', value: '2' },
              { label: 'I\'m worried their current path isn\'t as secure as it seems — AI, layoffs, burnout', value: '3' },
              { label: 'They already have skills and clients but need the license and structure to grow', value: '4' },
              { label: 'They need to start earning money NOW — they can\'t wait years', value: '5' }
            ]
      },
      5: {
        number: 'Question 5 of 7',
        text: isSelf
          ? 'If you could fast-forward 12 months, what would matter most to you?'
          : 'If you could fast-forward 12 months for them, what would matter most to you?',
        options: isSelf
          ? [
              { label: 'I\'m earning good money doing work I actually enjoy — no debt, no dead end', value: 'income' },
              { label: 'I have the skills and freedom to build something of my own whenever I\'m ready', value: 'freedom' },
              { label: 'I feel secure — I have a skill that\'s always in demand and can\'t be taken away', value: 'security' },
              { label: 'My bills are handled, my family is proud, and I\'m finally in control', value: 'family' }
            ]
          : [
              { label: 'They\'re earning good money doing work they enjoy — no debt, no dead end', value: 'income' },
              { label: 'They have the skills and freedom to build something of their own', value: 'freedom' },
              { label: 'They have a secure skill that\'s always in demand and can\'t be taken away', value: 'security' },
              { label: 'They\'re independent, their future is on track, and the family feels at peace', value: 'family' }
            ]
      },
      6: {
        number: 'Question 6 of 7',
        text: isSelf
          ? 'How important is it to you that your career can\'t be replaced by AI or automation?'
          : 'How important is it to you that their career can\'t be replaced by AI or automation?',
        options: isSelf
          ? [
              { label: 'Extremely important — it\'s one of my top concerns', value: 'high' },
              { label: 'Somewhat important — I think about it', value: 'medium' },
              { label: 'Not something I\'ve considered much', value: 'low' }
            ]
          : [
              { label: 'Extremely important — it\'s one of my top concerns for them', value: 'high' },
              { label: 'Somewhat important — I think about it', value: 'medium' },
              { label: 'Not something I\'ve considered much', value: 'low' }
            ]
      }
    };
  }

  // ============ LEAD CAPTURE TEASES ============
  function getLeadCaptureTease(bucket, perspective) {
    const isSelf = perspective === 'self';
    const teases = {
      1: {
        self: {
          headline: "We've identified your #1 Career Path Blind Spot.",
          sub: "Enter your email to get your personalized Career Blind Spot Report and discover the fastest path to breaking through the degree myth."
        },
        other: {
          headline: "We've identified their #1 Career Path Blind Spot.",
          sub: "Enter your email to get the Career Blind Spot Report — it'll show you both the fastest path to breaking through the degree myth."
        }
      },
      2: {
        self: {
          headline: "We've identified your #1 Career Path Blind Spot.",
          sub: "Enter your email to get your personalized Career Blind Spot Report with the real cost-vs-income numbers that change everything."
        },
        other: {
          headline: "We've identified their #1 Career Path Blind Spot.",
          sub: "Enter your email to get the Career Blind Spot Report with the real cost-vs-income numbers you can review together."
        }
      },
      3: {
        self: {
          headline: "We've identified your #1 Career Path Blind Spot.",
          sub: "Enter your email to get your personalized Career Blind Spot Report and see which careers are truly layoff-proof and AI-proof."
        },
        other: {
          headline: "We've identified their #1 Career Path Blind Spot.",
          sub: "Enter your email to get the Career Blind Spot Report showing which careers are truly layoff-proof and AI-proof."
        }
      },
      4: {
        self: {
          headline: "We've identified your #1 Career Path Blind Spot.",
          sub: "Enter your email to get your personalized Career Blind Spot Report and discover the fastest path from talent to licensed professional."
        },
        other: {
          headline: "We've identified their #1 Career Path Blind Spot.",
          sub: "Enter your email to get the Career Blind Spot Report with the fastest path from talent to licensed professional."
        }
      },
      5: {
        self: {
          headline: "We've identified your #1 Career Path Blind Spot.",
          sub: "Enter your email to get your personalized Career Blind Spot Report and see how people in your exact situation started earning within months."
        },
        other: {
          headline: "We've identified their #1 Career Path Blind Spot.",
          sub: "Enter your email to get the Career Blind Spot Report showing how people in their exact situation started earning within months."
        }
      }
    };
    return teases[bucket][isSelf ? 'self' : 'other'];
  }

  // ============ INITIALIZATION ============
  function init() {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    state.hook = params.get('hook') || 'blindspot';
    state.src = params.get('src') || 'direct';

    // Set dynamic headline
    const hookText = HOOKS[state.hook] || HOOKS.blindspot;
    document.querySelectorAll('[data-hook-headline]').forEach(el => {
      el.textContent = hookText;
    });

    // Bind welcome page buttons
    document.querySelectorAll('[data-start-quiz]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        startQuiz();
      });
    });
  }

  // ============ START QUIZ ============
  function startQuiz() {
    document.getElementById('welcome-page').classList.add('hidden');
    document.getElementById('quiz-container').classList.add('active');
    showQuestion(1);
  }

  // ============ SHOW QUESTION ============
  function showQuestion(num) {
    state.currentQuestion = num;
    const questions = getQuestions();
    const q = questions[num];
    if (!q) return;

    // Update progress bar
    const progress = ((num - 1) / state.totalQuestions) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';

    // Hide all question screens
    document.querySelectorAll('.question-screen').forEach(el => el.classList.remove('active'));

    // Build question screen
    const screen = document.getElementById('question-screen');
    screen.innerHTML = '';

    const numberEl = document.createElement('div');
    numberEl.className = 'question-number';
    numberEl.textContent = q.number;

    const textEl = document.createElement('div');
    textEl.className = 'question-text';
    textEl.textContent = q.text;

    const optionsEl = document.createElement('div');
    optionsEl.className = 'answer-options';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', function() {
        handleAnswer(num, opt.value);
      });
      optionsEl.appendChild(btn);
    });

    screen.appendChild(numberEl);
    screen.appendChild(textEl);
    screen.appendChild(optionsEl);
    screen.classList.add('active');

    // Animate in
    screen.style.animation = 'none';
    screen.offsetHeight; // trigger reflow
    screen.style.animation = 'fadeIn 0.4s ease';
  }

  // ============ HANDLE ANSWER ============
  function handleAnswer(questionNum, value) {
    state.answers['q' + questionNum] = value;

    // Q1 sets perspective for all subsequent branching
    if (questionNum === 1) {
      state.perspective = value; // 'self' or 'other'
    }

    // Q4 sets bucket
    if (questionNum === 4) {
      state.bucket = parseInt(value);
    }

    // Visual feedback
    const selected = event.target;
    selected.classList.add('selected');

    // Advance after brief delay
    setTimeout(function() {
      if (questionNum < 6) {
        showQuestion(questionNum + 1);
      } else if (questionNum === 6) {
        showLeadCapture();
      }
    }, 350);
  }

  // ============ LEAD CAPTURE ============
  function showLeadCapture() {
    // Update progress bar to ~95%
    document.getElementById('progress-bar').style.width = '90%';

    // Hide quiz
    document.querySelectorAll('.question-screen').forEach(el => el.classList.remove('active'));
    document.getElementById('quiz-container').classList.remove('active');

    // Show lead capture
    const lc = document.getElementById('lead-capture');
    const tease = getLeadCaptureTease(state.bucket, state.perspective);
    const bucketInfo = BUCKETS[state.bucket];

    document.getElementById('lc-headline').textContent = tease.headline;
    document.getElementById('lc-code').textContent = bucketInfo.code;
    document.getElementById('lc-subtext').textContent = tease.sub;

    lc.classList.add('active');

    // Bind form
    document.getElementById('lead-form').addEventListener('submit', function(e) {
      e.preventDefault();
      submitLead();
    });

    // Skip link
    document.getElementById('skip-to-results').addEventListener('click', function() {
      showOutcome();
    });
  }

  // ============ LEAD CAPTURE CONFIG ============
  // Formsubmit.co — sends each lead to this email address (no backend needed)
  // IMPORTANT: Replace with the actual email to receive leads
  var LEAD_EMAIL = 'leads@jtcutsacademy.com';

  // Optional: Google Sheets endpoint (leave empty to skip)
  var GOOGLE_SCRIPT_URL = '';

  // ============ SUBMIT LEAD ============
  function submitLead() {
    var name = document.getElementById('lead-name').value.trim();
    var email = document.getElementById('lead-email').value.trim();

    if (!email) {
      document.getElementById('lead-email').style.borderColor = '#e74c3c';
      return;
    }

    // Collect all data
    var data = {
      name: name,
      email: email,
      hook: state.hook,
      source: state.src,
      perspective: state.perspective,
      q1_for: state.answers.q1,
      q2_emotion: state.answers.q2,
      q3_demographic: state.answers.q3,
      q4_bucket: state.answers.q4,
      q5_aspiration: state.answers.q5,
      q6_ai_concern: state.answers.q6,
      bucket_number: state.bucket,
      bucket_name: BUCKETS[state.bucket].name,
      bucket_code: BUCKETS[state.bucket].code,
      timestamp: new Date().toISOString()
    };

    // === EMAIL VIA FORMSUBMIT.CO ===
    // Sends lead data directly to your inbox — free, no signup needed
    if (LEAD_EMAIL) {
      var formData = new FormData();
      formData.append('_subject', 'New Quiz Lead: ' + data.bucket_name + ' (' + data.bucket_code + ')');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('Name', data.name);
      formData.append('Email', data.email);
      formData.append('Quiz Result', data.bucket_name + ' (Code: ' + data.bucket_code + ')');
      formData.append('Bucket #', data.bucket_number);
      formData.append('Perspective', data.perspective);
      formData.append('Hook Used', data.hook || 'direct');
      formData.append('Traffic Source', data.source || 'direct');
      formData.append('Q1 - For Whom', data.q1_for);
      formData.append('Q2 - Primary Emotion', data.q2_emotion);
      formData.append('Q3 - Demographic', data.q3_demographic);
      formData.append('Q4 - Main Concern (Bucket)', data.q4_bucket);
      formData.append('Q5 - Aspiration', data.q5_aspiration);
      formData.append('Q6 - AI Concern', data.q6_ai_concern);
      formData.append('Submitted At', data.timestamp);

      fetch('https://formsubmit.co/ajax/' + LEAD_EMAIL, {
        method: 'POST',
        body: formData
      }).then(function(res) {
        console.log('Lead sent to email:', res.ok ? 'success' : 'failed');
      }).catch(function(err) {
        console.log('Email send error (lead still saved locally):', err);
      });
    }

    // === GOOGLE SHEETS (optional) ===
    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function() {});
    }

    // === LOCAL BACKUP ===
    try {
      var leads = JSON.parse(localStorage.getItem('quiz_leads') || '[]');
      leads.push(data);
      localStorage.setItem('quiz_leads', JSON.stringify(leads));
    } catch(e) {}

    // Show outcome
    showOutcome();
  }

  // ============ SHOW OUTCOME ============
  function showOutcome() {
    // Hide everything else
    document.getElementById('welcome-page').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('active');
    document.getElementById('lead-capture').classList.remove('active');

    // Show the correct bucket outcome
    document.querySelectorAll('.outcome-page').forEach(el => el.classList.remove('active'));
    const outcomePage = document.getElementById('outcome-' + state.bucket);
    if (outcomePage) {
      outcomePage.classList.add('active');
      window.scrollTo(0, 0);
    }

    // Update progress
    document.getElementById('progress-bar').style.width = '100%';
  }

  // ============ BOOT ============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window._quizState = state;

})();
