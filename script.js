// Soat raqamlarini dinamik yaratish
const hourNumbers = document.getElementById('hourNumbers');

for (let i = 1; i <= 12; i++) {
    const hourNumber = document.createElement('div');
    hourNumber.className = 'hour-number';
    hourNumber.style.setProperty('--i', i);
    hourNumber.innerHTML = `<span>${i}</span>`;
    hourNumbers.appendChild(hourNumber);
}

// Elementlarni olish
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');

const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
                   "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", 
                 "Payshanba", "Juma", "Shanba"];

function updateTime() {
    const now = new Date();
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Analog soat hisob-kitoblari
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const secondDeg = seconds * 6 + milliseconds * 0.006;
    
    hourHand.style.transform = `rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
    
    // Raqamli soatni formatlash
    const fH = String(hours).padStart(2, '0');
    const fM = String(minutes).padStart(2, '0');
    const fS = String(seconds).padStart(2, '0');
    
    digitalTime.textContent = `${fH}:${fM}:${fS}`;
    
    // Sanani yangilash
    const day = dayNames[now.getDay()];
    const date = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    
    digitalDate.textContent = `${day}, ${date} ${month} ${year}`;
}

// Har 50ms da yangilab turish (yumshoq harakat uchun)
setInterval(updateTime, 50);
updateTime();

// Click effekti
const clock = document.querySelector('.clock');
clock.addEventListener('click', function() {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
});