import { backend } from "declarations/backend";

class StoryGenerator {
    constructor() {
        this.storyInterval = null;
        this.updateInterval = null;
        this.isActive = false;
        this.initializeElements();
        this.bindEvents();
        this.checkExistingStory();
    }

    initializeElements() {
        this.storyContent = document.getElementById('story-content');
        this.timer = document.getElementById('timer');
        this.status = document.getElementById('status');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.loadingSpinner = document.querySelector('.loading-spinner');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startStory());
        this.resetBtn.addEventListener('click', () => this.resetStory());
    }

    async checkExistingStory() {
        const story = await backend.getStory();
        if (story.isActive) {
            this.isActive = true;
            this.updateStoryDisplay(story.segments);
            this.startTimer(story.remainingTime);
            this.startStoryGeneration();
        }
    }

    async startStory() {
        try {
            this.showLoading();
            const initialSegment = await this.generateStorySegment("Start a new story");
            const success = await backend.startStory(initialSegment);
            
            if (success) {
                this.isActive = true;
                this.updateStoryDisplay([initialSegment]);
                this.startTimer(24 * 60 * 60 * 1000000000);
                this.startStoryGeneration();
                this.startBtn.disabled = true;
            }
        } catch (error) {
            console.error("Error starting story:", error);
        } finally {
            this.hideLoading();
        }
    }

    async resetStory() {
        await backend.resetStory();
        this.isActive = false;
        this.storyContent.innerHTML = '';
        this.clearIntervals();
        this.timer.textContent = '24:00:00';
        this.status.textContent = 'Story ready to begin';
        this.startBtn.disabled = false;
    }

    startStoryGeneration() {
        this.storyInterval = setInterval(async () => {
            if (this.isActive) {
                try {
                    this.showLoading();
                    const newSegment = await this.generateStorySegment("Continue the story");
                    const success = await backend.addSegment(newSegment);
                    
                    if (!success) {
                        this.stopStory();
                    }
                } catch (error) {
                    console.error("Error generating story:", error);
                } finally {
                    this.hideLoading();
                }
            }
        }, 5 * 60 * 1000); // Generate new segment every 5 minutes

        this.updateInterval = setInterval(async () => {
            const story = await backend.getStory();
            this.updateStoryDisplay(story.segments);
        }, 10000); // Update display every 10 seconds
    }

    async generateStorySegment(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: 150
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    updateStoryDisplay(segments) {
        this.storyContent.innerHTML = segments
            .map(segment => `<p>${segment}</p>`)
            .join('');
        this.storyContent.scrollTop = this.storyContent.scrollHeight;
    }

    startTimer(remainingNanos) {
        const updateTimer = () => {
            const remainingSeconds = Math.floor(remainingNanos / 1000000000);
            if (remainingSeconds <= 0) {
                this.stopStory();
                return;
            }

            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;

            this.timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            remainingNanos -= 1000000000;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }

    stopStory() {
        this.isActive = false;
        this.clearIntervals();
        this.status.textContent = 'Story completed';
        this.startBtn.disabled = false;
    }

    clearIntervals() {
        if (this.storyInterval) clearInterval(this.storyInterval);
        if (this.updateInterval) clearInterval(this.updateInterval);
    }

    showLoading() {
        this.loadingSpinner.classList.remove('d-none');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('d-none');
    }
}

// Initialize the story generator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new StoryGenerator();
});
