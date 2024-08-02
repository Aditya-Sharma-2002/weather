const topic1 = document.querySelector('.topic1');
const topic2 = document.querySelector('.topic2');
const topic3 = document.querySelector('.topic3');
const allSections = document.querySelectorAll('.section');
const imgTargets = document.querySelectorAll('img[data-src]');
// Topic Swiping

const topicObserver = function(entries, observer){
    const [entry] = entries;
    console.log(entry);

    if(!entry.isIntersecting) return;

    entry.target.classList.remove('fadeOut');
    observer.unobserve(entry.target);
};

const obsOption = {
    root: null,
    threshold: 0.10,
};

const observer = new IntersectionObserver(topicObserver, obsOption);
// observer.observe(topic1);
// observer.observe(topic2);
allSections.forEach(function(section){
    observer.observe(section);
    section.classList.add('fadeOut');
});

// Lazy Loading Images

const imgObserver = new IntersectionObserver(loadImg, {});

