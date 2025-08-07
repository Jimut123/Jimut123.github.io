
// Modal elements
const codeModal = document.getElementById('codeModal');
const codeModalTitle = document.getElementById('codeModalTitle');
const codeContent = document.getElementById('codeContent');
const loadingSpinner = document.getElementById('loadingSpinner');
const closeModalBtn = document.getElementById('closeModal');


// Enhanced Python syntax highlighter that treats triple-quoted strings as comments
// Enhanced Python syntax highlighter with proper HTML entity handling
function highlightPythonCode(code) {
    // Don't escape HTML here - we'll handle it token by token
    // const escapedCode = code.replace(/[&<>]/g, function(match) {
    //     return {'&': '&amp;', '<': '&lt;', '>': '&gt;'}[match];
    // });

    // Process the entire code to handle multi-line triple-quoted strings
    let processedCode = '';
    let i = 0;
    const lines = code.split('\n'); // Use original code, not escaped
    let inTripleQuote = false;
    let tripleQuoteType = '';

    const processedLines = lines.map((line, lineIndex) => {
        let processedLine = '';
        let i = 0;

        while (i < line.length) {
            // Handle existing triple-quoted blocks
            if (inTripleQuote) {
                if (line.substr(i, 3) === tripleQuoteType) {
                    processedLine += tripleQuoteType;
                    inTripleQuote = false;
                    tripleQuoteType = '';
                    i += 3;
                } else {
                    processedLine += line[i];
                    i++;
                }
                continue;
            }

            // Check for start of triple quotes
            if (line.substr(i, 3) === '"""' || line.substr(i, 3) === "'''") {
                tripleQuoteType = line.substr(i, 3);
                inTripleQuote = true;
                processedLine += tripleQuoteType;
                i += 3;
                continue;
            }

            processedLine += line[i];
            i++;
        }

        // Mark entire line as comment if it's inside triple quotes
        if (inTripleQuote || processedLine.includes('"""') || processedLine.includes("'''")) {
            return { line: processedLine, isTripleQuoted: true, lineNum: lineIndex + 1 };
        }

        return { line: processedLine, isTripleQuoted: false, lineNum: lineIndex + 1 };
    });

    // Build highlighted HTML
    let html = '';
    processedLines.forEach(lineObj => {
        if (lineObj.isTripleQuoted) {
            // Escape HTML entities for safe display but preserve original characters
            const escapedLine = escapeHTMLSafe(lineObj.line);
            html += `<span class="code-line" data-line="${lineObj.lineNum}"><span class="comment">${escapedLine}</span></span>\n`;
        } else {
            // Apply normal tokenization
            const tokens = tokenizeLine(lineObj.line);
            const highlightedLine = tokens.map(t => {
                if (t.type === 'text') return escapeHTMLSafe(t.value);
                return `<span class="${t.type}">${escapeHTMLSafe(t.value)}</span>`;
            }).join('');
            html += `<span class="code-line" data-line="${lineObj.lineNum}">${highlightedLine}</span>\n`;
        }
    });

    return html;
}

// Safe HTML escaping function that preserves readability
function escapeHTMLSafe(str) {
    return str.replace(/[&<]/g, function(match) {
        return {'&': '&amp;', '<': '&lt;'}[match];
        // Note: We're NOT escaping '>' to preserve readability of operators like >=
    });
}

// Updated tokenizeLine function with safe HTML handling
function tokenizeLine(line) {
    const tokens = [];
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        // Skip whitespace
        if (/\s/.test(char)) {
            let whitespace = '';
            while (i < line.length && /\s/.test(line[i])) {
                whitespace += line[i];
                i++;
            }
            tokens.push({ type: 'text', value: whitespace });
            continue;
        }
        
        // Comments
        if (char === '#') {
            const comment = line.substring(i);
            tokens.push({ type: 'comment', value: comment });
            break;
        }
        
        // Triple quotes - treat completely as comments
        if (line.substr(i, 3) === '"""' || line.substr(i, 3) === "'''") {
            const quote = line.substr(i, 3);
            let str = quote;
            i += 3;
            
            // Get rest of line after triple quotes
            while (i < line.length) {
                str += line[i];
                if (line.substr(i, 3) === quote) {
                    str += quote;
                    i += 3;
                    break;
                }
                i++;
            }
            tokens.push({ type: 'comment', value: str });
            continue;
        }
        
        // Regular strings (single/double quotes only)
        if (char === '"' || char === "'") {
            const quote = char;
            let str = quote;
            i++;
            
            while (i < line.length && line[i] !== quote) {
                if (line[i] === '\\' && i + 1 < line.length) {
                    str += line[i] + line[i + 1];
                    i += 2;
                } else {
                    str += line[i];
                    i++;
                }
            }
            if (i < line.length) {
                str += line[i];
                i++;
            }
            tokens.push({ type: 'string', value: str });
            continue;
        }
        
        // Numbers
        if (/\d/.test(char)) {
            let num = '';
            while (i < line.length && /[\d.]/.test(line[i])) {
                num += line[i];
                i++;
            }
            tokens.push({ type: 'number', value: num });
            continue;
        }
        
        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(char)) {
            let word = '';
            while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
                word += line[i];
                i++;
            }
            
            const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'break', 'continue', 'pass', 'raise', 'assert', 'del', 'global', 'nonlocal', 'lambda', 'and', 'or', 'not', 'in', 'is'];
            const builtins = ['True', 'False', 'None', 'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'bool', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'open', 'max', 'min', 'sum', 'abs', 'round', 'sorted', 'reversed'];
            
            if (keywords.includes(word)) {
                tokens.push({ type: 'keyword', value: word });
            } else if (builtins.includes(word)) {
                tokens.push({ type: 'builtin', value: word });
            } else if (word === 'self') {
                tokens.push({ type: 'builtin', value: word });
            } else {
                // Check if it's a function definition
                let nextNonSpace = i;
                while (nextNonSpace < line.length && /\s/.test(line[nextNonSpace])) {
                    nextNonSpace++;
                }
                if (nextNonSpace < line.length && line[nextNonSpace] === '(') {
                    tokens.push({ type: 'function', value: word });
                } else {
                    tokens.push({ type: 'text', value: word });
                }
            }
            continue;
        }
        
        // Operators and punctuation (including > properly)
        if (/[+\-*/%=<>!&|^~]/.test(char)) {
            let op = char;
            i++;
            // Handle multi-character operators
            if (i < line.length) {
                const nextChar = line[i];
                if ((char === '=' && nextChar === '=') ||
                    (char === '!' && nextChar === '=') ||
                    (char === '<' && nextChar === '=') ||
                    (char === '>' && nextChar === '=') ||
                    (char === '*' && nextChar === '*') ||
                    (char === '/' && nextChar === '/')) {
                    op += nextChar;
                    i++;
                }
            }
            tokens.push({ type: 'operator', value: op });
            continue;
        }
        
        // Brackets and parentheses
        if (/[\[\]]/.test(char)) {
            tokens.push({ type: 'bracket', value: char });
            i++;
            continue;
        }
        if (/[()]/.test(char)) {
            tokens.push({ type: 'paren', value: char });
            i++;
            continue;
        }
        if (/[{}]/.test(char)) {
            tokens.push({ type: 'brace', value: char });
            i++;
            continue;
        }
        
        // Decorators
        if (char === '@') {
            let decorator = '@';
            i++;
            while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
                decorator += line[i];
                i++;
            }
            tokens.push({ type: 'decorator', value: decorator });
            continue;
        }
        
        // Default case
        tokens.push({ type: 'text', value: char });
        i++;
    }
    
    return tokens;
}




// Function to show code modal
function showCodeModal(title, content) {
    codeModalTitle.textContent = title;
    loadingSpinner.style.display = 'none';
    codeContent.style.display = 'block';
    
    // Apply syntax highlighting
    const highlightedCode = highlightPythonCode(content);
    codeContent.innerHTML = highlightedCode;
    
    codeModal.style.display = 'flex';
    
    // Focus the modal for keyboard navigation
    setTimeout(() => {
        codeModal.focus();
    }, 100);
}

// Function to show loading state
function showLoadingModal(title) {
    codeModalTitle.textContent = title;
    loadingSpinner.style.display = 'flex';
    codeContent.style.display = 'none';
    codeModal.style.display = 'flex';
}

// Function to hide modal
function hideCodeModal() {
    codeModal.style.display = 'none';
    codeContent.innerHTML = '';
}

// Close modal events
closeModalBtn.addEventListener('click', hideCodeModal);

codeModal.addEventListener('click', function(e) {
    if (e.target === codeModal) {
        hideCodeModal();
    }
});

// ESC key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && codeModal.style.display === 'flex') {
        hideCodeModal();
    }
});

// Python Code button handler
document.querySelectorAll('.code-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const codePath = btn.getAttribute('data-codepath');
        const problemName = btn.closest('.problem-item').querySelector('.problem-name').textContent;
        
        if (!codePath) {
            showCodeModal(`${problemName} - Python Code`, '# Error: No code path specified for this problem.\n# Please check the data-codepath attribute.');
            return;
        }

        // Show loading state
        showLoadingModal(`${problemName} - Loading...`);

        try {
            const response = await fetch(codePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const codeText = await response.text();
            
            // Show the code with syntax highlighting
            showCodeModal(`📄 ${problemName}.py`, codeText);
            
        } catch (error) {
            let errorMessage = '# Error loading code file\n\n';
            
            if (error.message.includes('HTTP 404')) {
                errorMessage += `# File not found: ${codePath}\n# Please make sure the Python file exists at the specified path.\n\n`;
                errorMessage += '# Example file structure:\n';
                errorMessage += '# ./code/\n#   ├── arrays/\n#   │   └── two_sum.py\n#   ├── stack/\n#   └── ...\n';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage += '# Network error: Unable to fetch the code file.\n';
                errorMessage += '# This might be due to:\n';
                errorMessage += '#   - CORS policy restrictions\n';
                errorMessage += '#   - File not being accessible via HTTP\n';
                errorMessage += '#   - Server configuration issues\n';
            } else {
                errorMessage += `# Error: ${error.message}\n`;
            }
            
            showCodeModal(`❌ ${problemName} - Error`, errorMessage);
        }
    });
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const meetingCards = document.querySelectorAll('.meeting-card[data-searchable]');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    if (searchTerm === '') {
        meetingCards.forEach(card => {
            card.classList.remove('hidden');
            card.querySelectorAll('.highlight').forEach(highlight => {
                highlight.outerHTML = highlight.innerHTML;
            });
        });
        return;
    }

    meetingCards.forEach(card => {
        let hasMatch = false;
        const problems = card.querySelectorAll('.problem-item');
        
        problems.forEach(problem => {
            const title = problem.getAttribute('data-title').toLowerCase();
            const nameElement = problem.querySelector('.problem-name');
            
            nameElement.innerHTML = nameElement.textContent;
            
            if (title.includes(searchTerm)) {
                hasMatch = true;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                nameElement.innerHTML = nameElement.textContent.replace(regex, '<span class="highlight">$1</span>');
                
                if (card.classList.contains('hidden')) {
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }
        });
        
        if (hasMatch) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
});

// Topic filtering
const topicBtns = document.querySelectorAll('.topic-btn');
const topicContents = document.querySelectorAll('.topic-problems');

topicBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        topicBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        topicContents.forEach(content => content.classList.remove('active'));
        
        const topic = this.getAttribute('data-topic');
        const targetContent = document.querySelector(`[data-topic-content="${topic}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// PDF link handler
document.querySelectorAll('.pdf-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('PDF notes will be linked here - you can host them on your server or use cloud storage');
    });
});

