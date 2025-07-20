class PaperBlog {
    constructor() {
        this.papers = document.querySelectorAll('.paper-card');
        this.searchInput = document.getElementById('searchInput');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.noResults = document.getElementById('noResults');
        this.activeFilter = 'all';
        
        this.initEventListeners();
        this.updateStats();
    }

    initEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.filterPapers(e.target.value, this.activeFilter);
        });

        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.getAttribute('data-filter'));
                this.filterPapers(this.searchInput.value, this.activeFilter);
            });
        });

        // Paper card interactions
        this.papers.forEach(paper => {
            paper.addEventListener('mouseenter', () => {
                this.animateCard(paper, 'enter');
            });
            
            paper.addEventListener('mouseleave', () => {
                this.animateCard(paper, 'leave');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }

    setActiveFilter(filter) {
        this.activeFilter = filter;
        
        // Update active tab
        this.filterTabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    }

    filterPapers(searchTerm, filter) {
        const visiblePapers = [];
        
        this.papers.forEach(paper => {
            const title = paper.querySelector('.paper-title a').textContent.toLowerCase();
            const authors = paper.querySelector('.paper-authors').textContent.toLowerCase();
            const tags = paper.getAttribute('data-tags').toLowerCase();
            const notes = paper.getAttribute('data-notes')?.toLowerCase() || '';
            const summary = paper.querySelector('.paper-summary').textContent.toLowerCase();
            const venue = paper.querySelector('.paper-venue').textContent.toLowerCase();
            const status = paper.getAttribute('data-status');
            
            // Enhanced search that includes all content
            const matchesSearch = !searchTerm || 
                title.includes(searchTerm.toLowerCase()) ||
                authors.includes(searchTerm.toLowerCase()) ||
                tags.includes(searchTerm.toLowerCase()) ||
                notes.includes(searchTerm.toLowerCase()) ||
                summary.includes(searchTerm.toLowerCase()) ||
                venue.includes(searchTerm.toLowerCase());
            
            const matchesFilter = filter === 'all' || 
                tags.includes(filter) || 
                status === filter;
            
            if (matchesSearch && matchesFilter) {
                this.showPaper(paper);
                visiblePapers.push(paper);
            } else {
                this.hidePaper(paper);
            }
        });
        
        // Show/hide no results message
        this.noResults.style.display = visiblePapers.length === 0 ? 'block' : 'none';
        
        // Update results count in search placeholder
        this.updateSearchPlaceholder(visiblePapers.length, this.papers.length);
    }

    updateSearchPlaceholder(visible, total) {
        const defaultPlaceholder = "Search papers by title, authors, tags, or notes content...";
        if (visible !== total && this.searchInput.value) {
            this.searchInput.setAttribute('placeholder', `${visible} of ${total} papers shown`);
        } else {
            this.searchInput.setAttribute('placeholder', defaultPlaceholder);
        }
    }

    showPaper(paper) {
        paper.classList.remove('hidden');
        paper.style.display = 'block';
        
        // Animate in
        setTimeout(() => {
            paper.style.opacity = '1';
            paper.style.transform = 'translateY(0)';
        }, 50);
    }

    hidePaper(paper) {
        paper.style.opacity = '0';
        paper.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            paper.style.display = 'none';
            paper.classList.add('hidden');
        }, 300);
    }

    animateCard(paper, action) {
        if (action === 'enter') {
            paper.style.transform = 'translateY(-5px) scale(1.02)';
        } else {
            paper.style.transform = 'translateY(0) scale(1)';
        }
    }

    updateStats() {
        const total = this.papers.length;
        const read = document.querySelectorAll('[data-status="read"]').length;
        const reading = document.querySelectorAll('[data-status="reading"]').length;
        const planned = document.querySelectorAll('[data-status="planned"]').length;
        
        // Animate numbers
        this.animateNumber('totalPapers', total);
        this.animateNumber('readPapers', read);
        this.animateNumber('currentlyReading', reading);
        this.animateNumber('plannedPapers', planned);
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const duration = 1000;
        const startTime = Date.now();
        const startValue = 0;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Method to highlight search terms in results
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Export papers data for backup
    exportPapersData() {
        const papersData = Array.from(this.papers).map(paper => {
            return {
                title: paper.querySelector('.paper-title a').textContent,
                authors: paper.querySelector('.paper-authors').textContent,
                venue: paper.querySelector('.paper-venue').textContent,
                tags: paper.getAttribute('data-tags'),
                status: paper.getAttribute('data-status'),
                notes: paper.getAttribute('data-notes'),
                summary: paper.querySelector('.paper-summary').textContent,
                link: paper.querySelector('.paper-title a').href,
                notesLink: paper.querySelector('.btn-secondary').href
            };
        });
        
        const dataStr = JSON.stringify(papersData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'papers-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize the blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const paperBlog = new PaperBlog();
    
    // Make it globally accessible for console debugging
    window.paperBlog = paperBlog;
    
    // Add scroll effects
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.transform = 'translateY(-10px)';
            header.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
        } else {
            header.style.transform = 'translateY(0)';
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput === document.activeElement) {
                searchInput.blur();
            }
        }
    });
    
    // Add export functionality (accessible via console)
    console.log('Paper Blog initialized! Use paperBlog.exportPapersData() to export data.');
});