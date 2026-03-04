// Skill Definitions
const skills = {
    tier1: {
        name: 'Foundation',
        skills: [
            {
                id: 'doubleClick',
                name: 'Double Strike',
                icon: '⚔',
                description: 'Each click deals 1x more damage.',
                maxLevel: 5,
                baseCost: 10,
                costMultiplier: 1.5,
                effect: 'Increases click value'
            },
            {
                id: 'tripleClick',
                name: 'Triple Slash',
                icon: '⚡',
                description: 'Each click deals 1.5x more damage.',
                maxLevel: 5,
                baseCost: 25,
                costMultiplier: 1.6,
                effect: 'Increases click value further'
            }
        ]
    },
    tier2: {
        name: 'Combat',
        skills: [
            {
                id: 'masterStrike',
                name: 'Master Strike',
                icon: '🗡',
                description: 'Each click deals 2x more damage.',
                maxLevel: 4,
                baseCost: 100,
                costMultiplier: 2,
                effect: 'Massive click boost',
                requiresLevel: { doubleClick: 2 }
            },
            {
                id: 'resonance',
                name: 'Resonance',
                icon: '◆',
                description: 'Damage multiplies exponentially (1.3x per level).',
                maxLevel: 5,
                baseCost: 200,
                costMultiplier: 2.2,
                effect: 'Exponential damage growth',
                requiresLevel: { tripleClick: 2 }
            }
        ]
    },
    tier3: {
        name: 'Ascension',
        skills: [
            {
                id: 'ascension',
                name: 'Ascension',
                icon: '↑',
                description: 'Damage multiplies exponentially (1.5x per level).',
                maxLevel: 5,
                baseCost: 500,
                costMultiplier: 2.5,
                effect: 'Greater exponential growth',
                requiresLevel: { masterStrike: 2, resonance: 2 }
            },
            {
                id: 'void',
                name: 'Void Echo',
                icon: '◐',
                description: 'Damage doubles with each level (2x per level).',
                maxLevel: 6,
                baseCost: 1000,
                costMultiplier: 3,
                effect: 'Exponential void damage',
                requiresLevel: { ascension: 2 }
            }
        ]
    },
    tier4: {
        name: 'Transcendence',
        skills: [
            {
                id: 'eternity',
                name: 'Eternity Unbound',
                icon: '∞',
                description: 'Damage triples with each level (3x per level).',
                maxLevel: 5,
                baseCost: 5000,
                costMultiplier: 4,
                effect: 'Transcendent power',
                requiresLevel: { void: 2 }
            },
            {
                id: 'consciousness',
                name: 'Collective Consciousness',
                icon: '◈',
                description: 'Gain bonus damage based on total clicks.',
                maxLevel: 5,
                baseCost: 3000,
                costMultiplier: 3.5,
                effect: 'Click-based scaling',
                requiresLevel: { eternity: 1, void: 2 }
            }
        ]
    }
};

// Render skill tree
function renderSkillTree() {
    const container = document.getElementById('skillTreeContent');
    container.innerHTML = '';

    for (let tier in skills) {
        const category = skills[tier];
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('skill-category');

        const categoryName = document.createElement('div');
        categoryName.classList.add('category-name');
        categoryName.textContent = category.name;
        categoryDiv.appendChild(categoryName);

        for (let skill of category.skills) {
            const skillDiv = createSkillElement(skill);
            categoryDiv.appendChild(skillDiv);
        }

        container.appendChild(categoryDiv);
    }
}

// Create skill DOM element
function createSkillElement(skill) {
    const skillDiv = document.createElement('div');
    skillDiv.classList.add('skill');

    const currentLevel = gameState.upgrades[skill.id] || 0;
    const isLocked = !isSkillUnlocked(skill);
    const isMaxed = currentLevel >= skill.maxLevel;

    if (isLocked) {
        skillDiv.classList.add('locked');
    } else {
        skillDiv.classList.add('unlocked');
    }

    if (isMaxed) {
        skillDiv.classList.add('maxed');
    }

    // Icon
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('skill-icon');
    iconDiv.textContent = skill.icon;
    skillDiv.appendChild(iconDiv);

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('skill-info');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('skill-name');
    nameDiv.textContent = skill.name;
    infoDiv.appendChild(nameDiv);

    const descDiv = document.createElement('div');
    descDiv.classList.add('skill-desc');
    descDiv.textContent = skill.description;
    infoDiv.appendChild(descDiv);

    skillDiv.appendChild(infoDiv);

    // Cost and Level
    const costDiv = document.createElement('div');
    costDiv.classList.add('skill-cost');

    if (isMaxed) {
        const maxedBadge = document.createElement('span');
        maxedBadge.classList.add('maxed-badge');
        maxedBadge.textContent = 'Maxed';
        costDiv.appendChild(maxedBadge);
    } else {
        const levelDisplay = document.createElement('div');
        levelDisplay.style.fontSize = '0.9rem';
        levelDisplay.style.marginBottom = '4px';
        levelDisplay.textContent = `Lvl ${currentLevel}/${skill.maxLevel}`;
        costDiv.appendChild(levelDisplay);

        const cost = calculateSkillCost(skill, currentLevel);
        const costText = document.createElement('div');
        costText.style.fontSize = '1.2rem';
        costText.textContent = cost.toLocaleString();
        costDiv.appendChild(costText);
    }

    skillDiv.appendChild(costDiv);

    // Button
    const button = document.createElement('button');
    button.classList.add('skill-button');

    if (isMaxed) {
        button.textContent = 'Max';
        button.disabled = true;
    } else if (isLocked) {
        button.textContent = 'Locked';
        button.disabled = true;
    } else {
        const cost = calculateSkillCost(skill, currentLevel);
        if (gameState.points >= cost) {
            button.textContent = 'Buy';
            button.addEventListener('click', () => purchaseSkill(skill));
        } else {
            button.textContent = 'Buy';
            button.disabled = true;
        }
    }

    skillDiv.appendChild(button);

    return skillDiv;
}

// Check if skill is unlocked
function isSkillUnlocked(skill) {
    // First tier is always available
    if (skill.requiresLevel === undefined) {
        return true;
    }

    // Check requirements
    for (let reqSkill in skill.requiresLevel) {
        const requiredLevel = skill.requiresLevel[reqSkill];
        const currentLevel = gameState.upgrades[reqSkill] || 0;
        if (currentLevel < requiredLevel) {
            return false;
        }
    }

    return true;
}

// Calculate skill cost
function calculateSkillCost(skill, currentLevel) {
    return Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, currentLevel));
}

// Purchase skill
function purchaseSkill(skill) {
    const currentLevel = gameState.upgrades[skill.id] || 0;

    // Check if already maxed
    if (currentLevel >= skill.maxLevel) {
        return;
    }

    // Check if unlocked
    if (!isSkillUnlocked(skill)) {
        return;
    }

    const cost = calculateSkillCost(skill, currentLevel);

    // Check if enough points
    if (gameState.points < cost) {
        return;
    }

    // Purchase
    gameState.points -= cost;
    gameState.upgrades[skill.id] = currentLevel + 1;

    // Update display
    updateDisplay();
    renderSkillTree();

    // Save
    saveGameState();

    // Animate purchase
    animatePurchase();
}

// Animate purchase
function animatePurchase() {
    const content = document.getElementById('skillTreeContent');
    content.style.opacity = '0.8';
    setTimeout(() => {
        content.style.opacity = '1';
    }, 100);
}

// Event listener for skill tree button (re-render on open)
const skillTreeBtn = document.getElementById('skillTreeBtn');
const originalOpenSkillTree = window.openSkillTree;

window.openSkillTree = function() {
    originalOpenSkillTree();
    renderSkillTree();
};

// Initial render when modal opens
document.getElementById('skillTreeModal').addEventListener('click', (e) => {
    if (e.target.id === 'skillTreeModal') {
        // This will be handled by closeOnBackdropClick
    }
});

// Make renderSkillTree available globally
window.renderSkillTree = renderSkillTree;
