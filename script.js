// --- CONFIG & GLOBAL STATE ---
const STATE = {
    uptimeSeconds: 15482310, // Simulated uptime starting value (~179 days)
    terminalHistory: [],
    historyIndex: -1,
    charts: {
        cpu: { data: Array(30).fill(20), color: '#00f5ff', shadowColor: 'rgba(0, 245, 255, 0.2)' },
        mem: { data: Array(30).fill(40), color: '#05f08f', shadowColor: 'rgba(5, 240, 143, 0.2)' },
        net: { data: Array(30).fill(100), color: '#ffaa00', shadowColor: 'rgba(255, 170, 0, 0.2)' }
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initUptime();
    initMobileMenu();
    initDashboardCharts();
    initTerminal();
    initContactForm();
    initScrollSpy();
});

// --- UPTIME COUNTER ---
function initUptime() {
    const counterEl = document.getElementById('uptime-counter');
    
    function updateCounter() {
        STATE.uptimeSeconds++;
        const days = Math.floor(STATE.uptimeSeconds / (24 * 3600));
        let remainder = STATE.uptimeSeconds % (24 * 3600);
        const hours = Math.floor(remainder / 3600);
        remainder = remainder % 3600;
        const minutes = Math.floor(remainder / 60);
        const seconds = remainder % 60;

        const pad = (num) => String(num).padStart(2, '0');
        
        counterEl.textContent = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    
    updateCounter();
    setInterval(updateCounter, 1000);
}

// --- MOBILE MENU DRAWER ---
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const drawerItems = document.querySelectorAll('.mobile-nav-item');

    toggleBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            drawer.classList.remove('open');
            toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        } else {
            drawer.classList.add('open');
            toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        }
    });

    drawerItems.forEach(item => {
        item.addEventListener('click', () => {
            drawer.classList.remove('open');
            toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });
}

// --- LIVE TELEMETRY DASHBOARD CHARTS ---
function initDashboardCharts() {
    const canvases = {
        cpu: document.getElementById('cpu-chart'),
        mem: document.getElementById('mem-chart'),
        net: document.getElementById('net-chart')
    };

    const cpuValEl = document.getElementById('cpu-val');
    const memValEl = document.getElementById('mem-val');
    const netValEl = document.getElementById('net-val');

    // Canvas drawing function for a mini historical line chart
    function drawChart(canvas, chartState) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // Sync internal resolution
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.clearRect(0, 0, width, height);

        const data = chartState.data;
        const maxVal = canvas.id === 'net-chart' ? 500 : 100; // Peak scales
        const points = data.length;
        const stepX = width / (points - 1);

        // Drawing path
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const val = data[i];
            const x = i * stepX;
            const y = height - (val / maxVal) * (height - 10) - 5; // bounds mapping

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        // Line styling
        ctx.strokeStyle = chartState.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Area gradient fill
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, chartState.shadowColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Main update tick
    function updateTelemetry() {
        // CPU Update (Fluctuates + Random Spike)
        const cpuData = STATE.charts.cpu.data;
        cpuData.shift();
        let nextCpu = cpuData[cpuData.length - 1] + (Math.random() * 10 - 5);
        nextCpu = Math.max(5, Math.min(95, nextCpu));
        cpuData.push(nextCpu);
        cpuValEl.textContent = `${nextCpu.toFixed(1)}%`;
        drawChart(canvases.cpu, STATE.charts.cpu);

        // Memory Update (Stable usage with slow drifts)
        const memData = STATE.charts.mem.data;
        memData.shift();
        let nextMem = memData[memData.length - 1] + (Math.random() * 2 - 1);
        nextMem = Math.max(30, Math.min(80, nextMem));
        memData.push(nextMem);
        memValEl.textContent = `${nextMem.toFixed(1)}%`;
        drawChart(canvases.mem, STATE.charts.mem);

        // Network Update (Spike packets)
        const netData = STATE.charts.net.data;
        netData.shift();
        let nextNet = netData[netData.length - 1] + (Math.random() * 60 - 30);
        if (Math.random() > 0.95) nextNet += Math.random() * 200; // Trigger spike
        nextNet = Math.max(20, Math.min(480, nextNet));
        netData.push(nextNet);
        netValEl.textContent = `${nextNet.toFixed(1)} KB/s`;
        drawChart(canvases.net, STATE.charts.net);
    }

    // Initial draw
    updateTelemetry();

    // Trigger update loop
    setInterval(updateTelemetry, 1000);

    // Redraw on window resize
    window.addEventListener('resize', () => {
        drawChart(canvases.cpu, STATE.charts.cpu);
        drawChart(canvases.mem, STATE.charts.mem);
        drawChart(canvases.net, STATE.charts.net);
    });
}

// --- TERMINAL EMULATOR ---
function initTerminal() {
    const inputEl = document.getElementById('terminal-input');
    const outputEl = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');

    if (!inputEl) return;

    // Focus input on terminal box click
    terminalBody.addEventListener('click', () => {
        inputEl.focus();
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = inputEl.value;
            const cleanCmd = rawCmd.trim();
            inputEl.value = '';

            if (cleanCmd !== '') {
                // Record in history
                STATE.terminalHistory.push(cleanCmd);
                STATE.historyIndex = STATE.terminalHistory.length;
                
                // Echo prompt and execute
                printEcho(cleanCmd);
                interpretCommand(cleanCmd);
            }
        } else if (e.key === 'ArrowUp') {
            // History travel
            if (STATE.terminalHistory.length > 0 && STATE.historyIndex > 0) {
                STATE.historyIndex--;
                inputEl.value = STATE.terminalHistory[STATE.historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (STATE.terminalHistory.length > 0 && STATE.historyIndex < STATE.terminalHistory.length - 1) {
                STATE.historyIndex++;
                inputEl.value = STATE.terminalHistory[STATE.historyIndex];
            } else {
                STATE.historyIndex = STATE.terminalHistory.length;
                inputEl.value = '';
            }
            e.preventDefault();
        }
    });

    function printEcho(cmd) {
        const div = document.createElement('div');
        div.className = 'cli-line';
        div.innerHTML = `<span class="prompt-user">sumit@padiyar-server:~$</span> <span class="cli-command-echo">${escapeHTML(cmd)}</span>`;
        outputEl.appendChild(div);
    }

    function scrollBottom() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Command Interpreter
    function interpretCommand(cmd) {
        const parts = cmd.toLowerCase().split(' ');
        const mainCmd = parts[0];
        const args = parts.slice(1);

        switch (mainCmd) {
            case 'help':
                printHelp();
                break;
            case 'neofetch':
                printNeofetch();
                break;
            case 'skills':
                printSkills();
                break;
            case 'experience':
                printExperience();
                break;
            case 'projects':
                printProjects();
                break;
            case 'contact':
                printContact();
                break;
            case 'clear':
                outputEl.innerHTML = '';
                break;
            case 'ping':
                runPing(args[0]);
                break;
            case 'cat':
                runCat(args[0]);
                break;
            case 'sudo':
                runSudo(args);
                break;
            default:
                printError(`Command not found: "${mainCmd}". Type "help" to list available operations.`);
        }
        scrollBottom();
    }

    // CLI Prints
    function printHelp() {
        const helpText = `
Available Profile Commands:
  <span class="cmd-text">neofetch</span>       Display System Info & Operator Overview
  <span class="cmd-text">skills</span>         List technical competencies categorized
  <span class="cmd-text">experience</span>     Show production history timeline
  <span class="cmd-text">projects</span>       Inspect portfolio project cards
  <span class="cmd-text">contact</span>        Show secure communication endpoints
  <span class="cmd-text">ping [host]</span>    Test network connection to host
  <span class="cmd-text">cat [file]</span>     Inspect profile documents (e.g. cat summary, cat certs)
  <span class="cmd-text">clear</span>          Flush console buffer
  <span class="cmd-text">sudo [cmd]</span>     Execute command with superuser rights
`;
        printOutput(helpText);
    }

    function printNeofetch() {
        const neofetchText = `
<div class="neofetch-container">
<div class="neofetch-logo">
      /\\_/\\
     ( o.o )
      > ^ <
  /\`\\_\\_/_/\\_/\`\\
 /\\_   /\\_  _\\/\\
 \\_/   \\_/  \\_/
</div>
<div class="neofetch-details">
<div class="neofetch-header">sumit@padiyar-server</div>
------------------------
<span>OS:</span> Red Hat Enterprise Linux (RHEL 9.3)
<span>Host:</span> AWS Elastic Cloud Compute (EC2) Node
<span>Kernel:</span> 5.14.0-362.8.1.el9_3.x86_64
<span>Uptime:</span> 179 days, 4 hours, 23 mins
<span>Shell:</span> bash 5.1.16
<span>Certifications:</span> RHCE, RHCSA, AWS Academy
<span>Processor:</span> vCPU Intel Xeon (Simulated)
<span>Memory:</span> 6720MiB / 16384MiB (41%)
<span>Current Job:</span> Linux/Cloud @ Infobell IT
</div>
</div>
`;
        printOutput(neofetchText);
    }

    function printSkills() {
        const skillsText = `
<span class="cli-info">TECHNICAL COMPETENCIES MATRIX</span>
-----------------------------
1. <span class="cmd-text">Operating Systems:</span> RHEL, CentOS, Ubuntu, Amazon Linux, WSL
2. <span class="cmd-text">Cloud Systems:</span>     AWS (EC2, S3, VPC, IAM, CloudWatch), VMware ESXi
3. <span class="cmd-text">DevOps & CI/CD:</span>    Jenkins Pipelines, Ansible, Docker, Git, GitHub
4. <span class="cmd-text">Log & Monitor:</span>     Prometheus, Grafana, Node Exporter, CloudWatch
5. <span class="cmd-text">Web Servers:</span>       Nginx, Apache HTTP Server, Zimbra Mail Server
6. <span class="cmd-text">Scripting:</span>         Bash/Shell script automation, Cron Jobs
7. <span class="cmd-text">Sec & Network:</span>     Firewalld, iptables, SELinux, VPN, DNS, DHCP, TCP/IP
`;
        printOutput(skillsText);
    }

    function printExperience() {
        const expText = `
<span class="cli-info">PROFESSIONAL HISTORY TIMELINE</span>
-----------------------------
1. <span class="cmd-text">Infobell IT</span> [April 2026 - Present]
   * Role: Linux/Cloud
   * Focus: HA operations, shell scripting, Ansible orchestration

2. <span class="cmd-text">Aforeserve.Com Ltd</span> [September 2024 - April 2026]
   * Role: Linux Administrator
   * Achievements: 
     - Maintained EDMS server infrastructure (99.9% uptime).
     - Automated pipelines reducing manual overhead by 70%.
     - Hardened firewalls reducing vulnerabilities by 60%.

3. <span class="cmd-text">Prodevans Technologies</span> [January 2024 - June 2024]
   * Role: DevOps Intern
   * Achievements:
     - Deployed Apache/Nginx web configs handling 10,000+ daily reqs.
     - Decreased system deployment timelines by 60% with Bash & Ansible.
`;
        printOutput(expText);
    }

    function printProjects() {
        const projText = `
<span class="cli-info">PORTFOLIO PROJECT HIGHLIGHTS</span>
----------------------------
1. <span class="cmd-text">Linux Server Monitoring (Grafana + Prometheus)</span>
   * Stack: Prometheus, Grafana, Node Exporter
   * Metric collection & visual charting on WSL Ubuntu Server.
   * Reduced inspection schedules by 70% with automatic alerting.

2. <span class="cmd-text">Jenkins CI/CD for Nginx Deploys</span>
   * Stack: Jenkins, Docker, Nginx, Git
   * Developed pipeline configuration triggers from GitHub commits.
   * Hands-on containerized workflow staging and container rollouts.
`;
        printOutput(projText);
    }

    function printContact() {
        const contactText = `
<span class="cli-info">COMMUNICATION ENDPOINTS</span>
-----------------------
* Email Address:  <a href="mailto:Sumit.Anand@infobellit.com">Sumit.Anand@infobellit.com</a>
* GitHub Link:    <a href="https://github.com" target="_blank">github.com/sumit-padiyar (Simulated)</a>
* LinkedIn:       <a href="https://linkedin.com" target="_blank">linkedin.com/in/sumit-padiyar (Simulated)</a>
`;
        printOutput(contactText);
    }

    function runPing(host) {
        if (!host) {
            printError('Usage: ping [hostname]');
            return;
        }

        printOutput(`PINGing ${escapeHTML(host)} with 56(84) bytes of telemetry data:`);
        
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 3) {
                clearInterval(interval);
                printOutput(`--- ${escapeHTML(host)} ping statistics ---`);
                printOutput(`3 packets transmitted, 3 received, 0% packet loss`);
                scrollBottom();
                return;
            }
            
            const rtt = (Math.random() * 40 + 5).toFixed(1);
            printOutput(`64 bytes from ${escapeHTML(host)}: icmp_seq=${count+1} ttl=64 time=${rtt} ms`);
            scrollBottom();
            count++;
        }, 300);
    }

    function runCat(file) {
        if (!file) {
            printError('Usage: cat [file_name] (e.g. cat summary, cat certs, cat education)');
            return;
        }

        const target = file.toLowerCase();
        if (target === 'summary') {
            printOutput(`
Linux Administrator with 1.8 years of hands-on experience in managing production environments. 
Strong expertise in Linux server administration, issue resolution, and system performance optimization. 
Experienced in automating workflows using Jenkins, containerization with Docker, and implementing monitoring 
solutions with Prometheus and Grafana. Familiar with AWS and building robust, scalable infrastructure.
`);
        } else if (target === 'certs' || target === 'certifications') {
            printOutput(`
1. Red Hat Certified Engineer (RHCE) - Credly Verified
2. Red Hat Certified System Administrator (RHCSA) - Credly Verified
3. AWS Academy Graduate (Cloud Foundations) - Credly Verified
4. DevOps with AWS Course Certificate - NareshIT
`);
        } else if (target === 'education') {
            printOutput(`
1. Rajarambapu Institute of Technology [2020 - 2024]
   - Degree: B.Tech in CS & IT
   - Location: Sangli, MH, India
2. Manere Junior College [2019 - 2020]
   - Certificate: HSC (Science)
3. DKTE High School [2018 - 2019]
   - Certificate: SSC
`);
        } else {
            printError(`File not readable or does not exist: "${file}". Available: "summary", "certs", "education"`);
        }
    }

    function runSudo(args) {
        if (args.length === 0) {
            printError('sudo: command arguments required.');
            return;
        }
        
        const fullCmd = args.join(' ');
        if (fullCmd.includes('rm -rf')) {
            printOutput('<span class="text-red">!!! CRITICAL WARNING !!!</span>');
            printOutput('Root filesystem purge request intercepted.');
            printOutput('Resolving system dependencies...');
            
            setTimeout(() => {
                printError('ACCESS DENIED: Sumit\'s SELinux policy blocked root deletion.');
                printOutput('[SELinux Log] Audit: user=guest_operator target=/ action=prevent result=safe');
                scrollBottom();
            }, 600);
        } else {
            printOutput('sudo: guest operator is not in the sudoers file. This incident will be reported.');
        }
    }

    // Helper functions
    function printOutput(htmlContent) {
        const div = document.createElement('div');
        div.className = 'cli-out-line';
        div.innerHTML = htmlContent;
        outputEl.appendChild(div);
    }

    function printError(msg) {
        const div = document.createElement('div');
        div.className = 'cli-out-line cli-error';
        div.textContent = `[ERROR] ${msg}`;
        outputEl.appendChild(div);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

// Global hook for quick clickable command text
window.executeQuickCmd = function(commandStr) {
    const inputEl = document.getElementById('terminal-input');
    const outputEl = document.getElementById('terminal-output');
    if (!inputEl) return;
    
    // Auto scroll to terminal
    document.getElementById('terminal').scrollIntoView({ behavior: 'smooth' });
    
    inputEl.value = '';
    
    // Wait a brief moment for scroll and fire
    setTimeout(() => {
        // Echo
        const div = document.createElement('div');
        div.className = 'cli-line';
        div.innerHTML = `<span class="prompt-user">sumit@padiyar-server:~$</span> <span class="cli-command-echo">${commandStr}</span>`;
        outputEl.appendChild(div);

        // Execute
        const terminalBody = document.getElementById('terminal-body');
        const inputEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        
        // Execute manual call to interpreter since we bypassed typing
        // Split parts
        const parts = commandStr.toLowerCase().split(' ');
        const mainCmd = parts[0];
        const args = parts.slice(1);
        
        // Match interpreter block directly
        switch (mainCmd) {
            case 'help':
                // Print help
                const helpText = `
Available Profile Commands:
  <span class="cmd-text">neofetch</span>       Display System Info & Operator Overview
  <span class="cmd-text">skills</span>         List technical competencies categorized
  <span class="cmd-text">experience</span>     Show production history timeline
  <span class="cmd-text">projects</span>       Inspect portfolio project cards
  <span class="cmd-text">contact</span>        Show secure communication endpoints
  <span class="cmd-text">ping [host]</span>    Test network connection to host
  <span class="cmd-text">cat [file]</span>     Inspect profile documents (e.g. cat summary, cat certs)
  <span class="cmd-text">clear</span>          Flush console buffer
  <span class="cmd-text">sudo [cmd]</span>     Execute command with superuser rights
`;
                printDirectOutput(helpText);
                break;
            case 'neofetch':
                const neofetchText = `
<div class="neofetch-container">
<div class="neofetch-logo">
      /\\_/\\
     ( o.o )
      > ^ <
  /\`\\_\\_/_/\\_/\`\\
 /\\_   /\\_  _\\/\\
 \\_/   \\_/  \\_/
</div>
<div class="neofetch-details">
<div class="neofetch-header">sumit@padiyar-server</div>
------------------------
<span>OS:</span> Red Hat Enterprise Linux (RHEL 9.3)
<span>Host:</span> AWS Elastic Cloud Compute (EC2) Node
<span>Kernel:</span> 5.14.0-362.8.1.el9_3.x86_64
<span>Uptime:</span> 179 days, 4 hours, 23 mins
<span>Shell:</span> bash 5.1.16
<span>Certifications:</span> RHCE, RHCSA, AWS Academy
<span>Processor:</span> vCPU Intel Xeon (Simulated)
<span>Memory:</span> 6720MiB / 16384MiB (41%)
<span>Current Job:</span> Linux/Cloud @ Infobell IT
</div>
</div>
`;
                printDirectOutput(neofetchText);
                break;
            case 'skills':
                const skillsText = `
<span class="cli-info">TECHNICAL COMPETENCIES MATRIX</span>
-----------------------------
1. <span class="cmd-text">Operating Systems:</span> RHEL, CentOS, Ubuntu, Amazon Linux, WSL
2. <span class="cmd-text">Cloud Systems:</span>     AWS (EC2, S3, VPC, IAM, CloudWatch), VMware ESXi
3. <span class="cmd-text">DevOps & CI/CD:</span>    Jenkins Pipelines, Ansible, Docker, Git, GitHub
4. <span class="cmd-text">Log & Monitor:</span>     Prometheus, Grafana, Node Exporter, CloudWatch
5. <span class="cmd-text">Web Servers:</span>       Nginx, Apache HTTP Server, Zimbra Mail Server
6. <span class="cmd-text">Scripting:</span>         Bash/Shell script automation, Cron Jobs
7. <span class="cmd-text">Sec & Network:</span>     Firewalld, iptables, SELinux, VPN, DNS, DHCP, TCP/IP
`;
                printDirectOutput(skillsText);
                break;
            case 'experience':
                const expText = `
<span class="cli-info">PROFESSIONAL HISTORY TIMELINE</span>
-----------------------------
1. <span class="cmd-text">Infobell IT</span> [April 2026 - Present]
   * Role: Linux/Cloud
   * Focus: HA operations, shell scripting, Ansible orchestration

2. <span class="cmd-text">Aforeserve.Com Ltd</span> [September 2024 - April 2026]
   * Role: Linux Administrator
   * Achievements: 
     - Maintained EDMS server infrastructure (99.9% uptime).
     - Automated pipelines reducing manual overhead by 70%.
     - Hardened firewalls reducing vulnerabilities by 60%.

3. <span class="cmd-text">Prodevans Technologies</span> [January 2024 - June 2024]
   * Role: DevOps Intern
   * Achievements:
     - Deployed Apache/Nginx web configs handling 10,000+ daily reqs.
     - Decreased system deployment timelines by 60% with Bash & Ansible.
`;
                printDirectOutput(expText);
                break;
            case 'projects':
                const projText = `
<span class="cli-info">PORTFOLIO PROJECT HIGHLIGHTS</span>
----------------------------
1. <span class="cmd-text">Linux Server Monitoring (Grafana + Prometheus)</span>
   * Stack: Prometheus, Grafana, Node Exporter
   * Metric collection & visual charting on WSL Ubuntu Server.
   * Reduced inspection schedules by 70% with automatic alerting.

2. <span class="cmd-text">Jenkins CI/CD for Nginx Deploys</span>
   * Stack: Jenkins, Docker, Nginx, Git
   * Developed pipeline configuration triggers from GitHub commits.
   * Hands-on containerized workflow staging and container rollouts.
`;
                printDirectOutput(projText);
                break;
            case 'clear':
                outputEl.innerHTML = '';
                break;
        }
        terminalBody.scrollTop = terminalBody.scrollHeight;
        inputEl.focus();
    }, 150);

    function printDirectOutput(htmlContent) {
        const div = document.createElement('div');
        div.className = 'cli-out-line';
        div.innerHTML = htmlContent;
        outputEl.appendChild(div);
    }
};

// --- CONTACT FORM LOGGER INTERACTIVITY ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    const logScreen = document.getElementById('log-screen');
    const logIndicator = document.getElementById('log-indicator');
    const submitBtn = document.getElementById('btn-submit');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value || 'System Message';
        const message = document.getElementById('message').value;

        // Reset form inputs partially
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';

        // Disable controls
        submitBtn.disabled = true;
        logIndicator.innerHTML = '<i class="fa-solid fa-circle text-cyan"></i> TUNNELING';
        logIndicator.classList.add('logging');

        // Clear screen and begin secure transmit logging sequence
        logScreen.innerHTML = '';
        
        const logs = [
            `[GATEWAY] Spawning SSH tunneling thread to SMTP portal (port 25)...`,
            `[GATEWAY] Connection handshake established successfully. Host: infobellit.com`,
            `[GATEWAY] Encoding payloads using GPG 4096-bit packet framing...`,
            `[GATEWAY] SENDER="${escapeHTML(name)}" <${escapeHTML(email)}>`,
            `[GATEWAY] SUBJECT="${escapeHTML(subject)}"`,
            `[GATEWAY] Initializing SMTP pipeline stream buffer...`,
            `[GATEWAY] Sending chunk packets [====================] 100%`,
            `[GATEWAY] Server response: 250 OK Message received for delivery.`,
            `[GATEWAY] Transmission completed successfully. Connection closing.`,
            `<span class="cli-success">[SUCCESS] Mail packet logged in Sumit's dashboard inbox.</span>`
        ];

        let index = 0;
        function logNext() {
            if (index < logs.length) {
                const line = document.createElement('p');
                line.className = 'log-line';
                line.innerHTML = logs[index];
                logScreen.appendChild(line);
                logScreen.scrollTop = logScreen.scrollHeight;
                index++;
                setTimeout(logNext, 550);
            } else {
                // Done logging
                logIndicator.innerHTML = '<i class="fa-solid fa-circle text-emerald"></i> DISPATCHED';
                logIndicator.classList.remove('logging');
                submitBtn.disabled = false;
            }
        }

        logNext();
    });

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

// --- SCROLL SPY & LINK HIGHLIGHT ---
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 200; // Offset for accuracy

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}
