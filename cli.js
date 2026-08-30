/**
 * ============================================================
 * CYBER CLI TERMINAL ENGINE — godzemohan.in
 * Developed for Mohan Kumar K (Godze Mohan)
 * ============================================================
 */

(function () {
	'use strict';

	const CLI_COMMANDS = {
		help: {
			desc: 'List all available system commands',
			usage: 'help [command]',
			exec: (args) => {
				if (args.length > 0) {
					const cmd = args[0].toLowerCase();
					if (CLI_COMMANDS[cmd]) {
						return `<span class="cli-accent">${cmd}</span> - ${CLI_COMMANDS[cmd].desc}<br><span class="cli-dim">Usage: ${CLI_COMMANDS[cmd].usage || cmd}</span>`;
					}
					return `<span class="cli-error">Unknown command: ${args[0]}</span>`;
				}

				let out = `<div class="cli-title">⚡ GODZE-OS CYBERNETIC COMMAND MATRIX ⚡</div>`;
				out += `<div class="cli-grid">`;
				for (const [name, meta] of Object.entries(CLI_COMMANDS)) {
					out += `<div class="cli-cmd-item"><span class="cli-cmd-name">${name.padEnd(12, ' ')}</span> <span class="cli-cmd-desc">${meta.desc}</span></div>`;
				}
				out += `</div><div class="cli-hint">Tip: Use [TAB] for autocompletion, [UP/DOWN] for command history, or press [~] to toggle.</div>`;
				return out;
			}
		},
		whoami: {
			desc: 'Display Mohan Kumar K identity, credentials, and bio',
			exec: () => {
				return `
<div class="cli-box">
  <div class="cli-accent"><strong>IDENTITY: MOHAN KUMAR K (Godze Mohan)</strong></div>
  <div>────────────────────────────────────────────────</div>
  <div><strong>Role:</strong> BCA Scholar & Cyber Security Researcher</div>
  <div><strong>Base:</strong> Bengaluru, India</div>
  <div><strong>Specialization:</strong> Network Security, Wireless Penetration, Packet Forensics</div>
  <div><strong>Collaborators:</strong> Darshan, Mohan Kumar K, Nandan</div>
  <div><strong>Portal:</strong> <a href="https://godzemohan.in" target="_blank" class="cli-link">godzemohan.in</a></div>
  <div><strong>Instagram:</strong> <a href="https://instagram.com/mr_uncuts" target="_blank" class="cli-link">@mr_uncuts</a></div>
  <div><strong>Status:</strong> <span class="cli-success">DEFENSE GRID ACTIVE • SECURITY SENTINEL ONLINE</span></div>
</div>`;
			}
		},
		boss: {
			desc: 'Display AI creator & administrative authority',
			exec: () => {
				return `<div class="cli-success">👑 MASTER CREATOR & SYSTEM BOSS: <strong>Mohan Kumar K (Godze Mohan)</strong></div>
<div>All AI neural agents, defensive firewalls, and server protocols operate under Mohan's direct authority.</div>`;
			}
		},
		skills: {
			desc: 'List offensive and defensive cybersecurity toolkit',
			exec: () => {
				return `
<div class="cli-title">🛠️ SECURITY TOOLSET & TECHNICAL ARSENAL</div>
<div>────────────────────────────────────────────────</div>
<div><span class="cli-accent">• Network Interception:</span> Bettercap, Wireshark, tcpdump, ARP/DNS Spoofing</div>
<div><span class="cli-accent">• Wireless Exploitation:</span> Aircrack-ng Suite, Monitor Mode (wlan0), Deauth Analysis</div>
<div><span class="cli-accent">• Recon & Scanning:</span> Nmap, Netdiscover, Shodan API, OSINT Frameworks</div>
<div><span class="cli-accent">• Scripting & Dev:</span> Python, Bash Scripting, HTML5/CSS3/JavaScript, Node.js</div>
<div><span class="cli-accent">• Operating Systems:</span> Kali Linux, Parrot Security OS, Arch Linux, macOS</div>`;
			}
		},
		projects: {
			desc: 'Show active cybersecurity research projects & demonstrations',
			exec: () => {
				return `
<div class="cli-title">📁 SECURITY RESEARCH PROJECTS</div>
<div>────────────────────────────────────────────────</div>
<div><span class="cli-success">[01] Modular MITM Attack Demonstration (2026)</span></div>
<div>     Full network packet interception lab, SSL stripping, credential harvesting analysis.</div>
<div>     <em>Authors: Darshan, Mohan Kumar K, Nandan</em></div>
<div>     Report: <a href="https://drive.google.com/file/d/1YKlLdlNDRAIJT9tbSFB27uVElkxUvBIR/view?usp=drive_link" target="_blank" class="cli-link">Download PDF Report</a></div>
<br>
<div><span class="cli-accent">[02] Wireless Defense & Packet Analysis Lab</span></div>
<div>     Active capture and deep-packet inspection using Wireshark and custom Lua dissecting rules.</div>
<div>     Doc: <a href="https://docs.google.com/document/d/1VBCWzZ4dHmxmgwYKDy2I85FO4nLGcZZe/edit?usp=drive_link" target="_blank" class="cli-link">Open Lab Documentation</a></div>`;
			}
		},
		files: {
			desc: 'List downloadable chapters, lab notes, and Google Drive links',
			exec: () => {
				return `
<div class="cli-title">📂 SHARED FILES & REPOSITORY ASSETS</div>
<div>────────────────────────────────────────────────</div>
<div>• <strong>Chapter 01 (PDF Report):</strong> <a href="https://drive.google.com/file/d/1YKlLdlNDRAIJT9tbSFB27uVElkxUvBIR/view?usp=drive_link" target="_blank" class="cli-link">[PDF Download]</a></div>
<div>• <strong>Chapter 01 (Lab Notes):</strong> <a href="https://docs.google.com/document/d/1VBCWzZ4dHmxmgwYKDy2I85FO4nLGcZZe/edit?usp=drive_link" target="_blank" class="cli-link">[Google Doc]</a></div>
<div>• <strong>Master Drive Folder:</strong> <a href="https://drive.google.com/drive/folders/1QNdvQtTCcnmPNPjpo5ioOtRX_u_YxdJH" target="_blank" class="cli-link">[All Cloud Assets]</a></div>`;
			}
		},
		ls: {
			desc: 'List virtual directory contents',
			exec: () => {
				return `drwxr-xr-x  mohan  staff   chapters/<br>-rw-r--r--  mohan  staff   MITM_Project_Report.pdf<br>-rw-r--r--  mohan  staff   Network_Lab_Notes.docx<br>-rwxr-xr-x  mohan  staff   bettercap_interceptor.sh<br>-rw-r--r--  mohan  staff   security_audit_2026.log`;
			}
		},
		nmap: {
			desc: 'Run a simulated high-speed network port scan on target',
			usage: 'nmap [target]',
			isAsync: true,
			execAsync: async (args, printLine) => {
				const target = args[0] || 'godzemohan.in';
				printLine(`<span class="cli-accent">Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}</span>`);
				printLine(`Initiating SYN Stealth Scan against ${target} [1000 ports]...`);
				
				await new Promise(r => setTimeout(r, 600));
				printLine(`Discovered open port <span class="cli-success">80/tcp</span> (HTTP - Cloudflare CDN) on ${target}`);
				await new Promise(r => setTimeout(r, 500));
				printLine(`Discovered open port <span class="cli-success">443/tcp</span> (HTTPS - TLS 1.3 / Quantum-Ready) on ${target}`);
				await new Promise(r => setTimeout(r, 500));
				printLine(`Discovered open port <span class="cli-accent">8443/tcp</span> (AI-SENTINEL-WSS - Mohan Neural Core) on ${target}`);
				await new Promise(r => setTimeout(r, 400));
				printLine(`Port 22/tcp (SSH): <span class="cli-warning">FILTERED (Key-Only / Port Knocking Enabled)</span>`);
				
				return `
<div class="cli-box">
  <div>Nmap scan report for <strong>${target}</strong></div>
  <div>Host is up (0.0024s latency).</div>
  <table class="cli-table">
    <thead><tr><th>PORT</th><th>STATE</th><th>SERVICE</th><th>VERSION</th></tr></thead>
    <tbody>
      <tr><td>80/tcp</td><td><span class="cli-success">open</span></td><td>http</td><td>Cloudflare Reverse Proxy</td></tr>
      <tr><td>443/tcp</td><td><span class="cli-success">open</span></td><td>ssl/https</td><td>TLS 1.3 Strict-Transport</td></tr>
      <tr><td>8443/tcp</td><td><span class="cli-success">open</span></td><td>ai-agent</td><td>Gemini 3.5 Flash Neural Node</td></tr>
      <tr><td>22/tcp</td><td><span class="cli-warning">filtered</span></td><td>ssh</td><td>OpenSSH (Admin Keyed)</td></tr>
    </tbody>
  </table>
  <div class="cli-success">Nmap done: 1 IP address (1 host up) scanned in 2.04 seconds.</div>
</div>`;
			}
		},
		mitm: {
			desc: 'Explain Man-in-the-Middle execution syntax and countermeasures',
			exec: () => {
				return `
<div class="cli-title">⚡ MODULAR MITM ATTACK WORKFLOW (ACADEMIC LAB)</div>
<div>────────────────────────────────────────────────</div>
<div><span class="cli-accent">1. Interface Monitor:</span> <code>sudo airmon-ng start wlan0</code></div>
<div><span class="cli-accent">2. Bettercap Execution:</span> <code>sudo bettercap -iface wlan0mon</code></div>
<div><span class="cli-accent">3. ARP Spoofing Module:</span> <code>set arp.spoof.targets 192.168.1.105; arp.spoof on</code></div>
<div><span class="cli-accent">4. Packet Inspection:</span> <code>net.sniff on</code></div>
<div>────────────────────────────────────────────────</div>
<div><span class="cli-success">DEFENSIVE COUNTERMEASURES:</span></div>
<div>• Dynamic ARP Inspection (DAI) & DHCP Snooping on network switches.</div>
<div>• Enforce HSTS (HTTP Strict Transport Security) to prevent SSL stripping.</div>
<div>• Use VPN tunnels with authenticated TLS handshakes.</div>`;
			}
		},
		ping: {
			desc: 'Measure network latency to Mohan Core Node',
			isAsync: true,
			execAsync: async (args, printLine) => {
				const host = args[0] || 'godzemohan.in';
				printLine(`PING ${host} (104.21.49.213): 56 data bytes`);
				for (let i = 1; i <= 4; i++) {
					await new Promise(r => setTimeout(r, 400));
					const pingMs = (Math.random() * 12 + 18).toFixed(1);
					printLine(`64 bytes from ${host}: icmp_seq=${i} ttl=58 time=${pingMs} ms`);
				}
				return `<span class="cli-success">--- ${host} ping statistics ---<br>4 packets transmitted, 4 packets received, 0.0% packet loss</span>`;
			}
		},
		socials: {
			desc: 'Connect with Mohan across social & research platforms',
			exec: () => {
				return `
<div class="cli-title">🌐 CONNECT WITH MOHAN KUMAR K</div>
<div>────────────────────────────────────────────────</div>
<div>• <strong>Instagram:</strong> <a href="https://instagram.com/mr_uncuts" target="_blank" class="cli-link">@mr_uncuts</a> (Photography & Video)</div>
<div>• <strong>YouTube:</strong> Esports Epicness (Gaming & Tech)</div>
<div>• <strong>Email:</strong> <a href="mailto:mohan7gen@gmail.com" class="cli-link">mohan7gen@gmail.com</a></div>
<div>• <strong>Portal:</strong> <a href="https://godzemohan.in" class="cli-link">https://godzemohan.in</a></div>`;
			}
		},
		sudo: {
			desc: 'Execute a command with superuser privileges',
			exec: (args) => {
				const cmd = args.join(' ') || 'root';
				return `<span class="cli-error">🔒 [AUTHENTICATION REQUIRED]</span><br>User "guest" is not in the sudoers file. This incident will be reported to Mohan Kumar K.`;
			}
		},
		matrix: {
			desc: 'Toggle visual Matrix cyber rain effect in terminal',
			exec: () => {
				const term = document.getElementById('cyber-cli-body');
				if (term) {
					term.classList.toggle('matrix-rain');
					return term.classList.contains('matrix-rain')
						? `<span class="cli-success">🟢 Matrix Digital Rain Activated. Enjoy the construct.</span>`
						: `<span class="cli-accent">Matrix Rain Deactivated.</span>`;
				}
				return 'Terminal body not found.';
			}
		},
		clear: {
			desc: 'Clear the terminal output',
			exec: () => {
				const out = document.getElementById('cli-output');
				if (out) out.innerHTML = '';
				return '';
			}
		},
		exit: {
			desc: 'Close the Cyber Terminal',
			exec: () => {
				window.closeCyberCLI();
				return 'Closing terminal session...';
			}
		}
	};

	let cmdHistory = [];
	let historyIndex = -1;

	window.openCyberCLI = function () {
		const modal = document.getElementById('cyber-cli-modal');
		const input = document.getElementById('cli-input');
		if (modal) {
			modal.style.display = 'flex';
			setTimeout(() => {
				modal.classList.add('active');
				if (input) input.focus();
			}, 10);
		}
	};

	window.closeCyberCLI = function () {
		const modal = document.getElementById('cyber-cli-modal');
		if (modal) {
			modal.classList.remove('active');
			setTimeout(() => {
				modal.style.display = 'none';
			}, 200);
		}
	};

	window.toggleCyberCLI = function () {
		const modal = document.getElementById('cyber-cli-modal');
		if (modal && modal.style.display === 'flex') {
			window.closeCyberCLI();
		} else {
			window.openCyberCLI();
		}
	};

	function printToCLI(html, isCommand = false) {
		const out = document.getElementById('cli-output');
		const body = document.getElementById('cyber-cli-body');
		if (!out) return;

		const div = document.createElement('div');
		div.className = isCommand ? 'cli-line cli-input-echo' : 'cli-line cli-response';
		div.innerHTML = html;
		out.appendChild(div);

		if (body) {
			body.scrollTop = body.scrollHeight;
		}
	}

	async function handleCLICommand(rawCommand) {
		const trimmed = rawCommand.trim();
		if (!trimmed) return;

		cmdHistory.push(trimmed);
		historyIndex = cmdHistory.length;

		printToCLI(`<span class="cli-prompt-user">guest@godzemohan.in</span>:<span class="cli-prompt-path">~</span>$ <span class="cli-typed">${escapeHTML(trimmed)}</span>`, true);

		const parts = trimmed.split(/\s+/);
		const cmdName = parts[0].toLowerCase();
		const args = parts.slice(1);

		if (CLI_COMMANDS[cmdName]) {
			const cmdObj = CLI_COMMANDS[cmdName];
			if (cmdObj.isAsync && cmdObj.execAsync) {
				const inputEl = document.getElementById('cli-input');
				if (inputEl) inputEl.disabled = true;
				try {
					const result = await cmdObj.execAsync(args, (line) => printToCLI(line, false));
					if (result) printToCLI(result, false);
				} catch (err) {
					printToCLI(`<span class="cli-error">Execution Error: ${err.message}</span>`, false);
				} finally {
					if (inputEl) {
						inputEl.disabled = false;
						inputEl.focus();
					}
				}
			} else {
				const result = cmdObj.exec(args);
				if (result) printToCLI(result, false);
			}
		} else {
			printToCLI(`<span class="cli-error">command not found: "${escapeHTML(cmdName)}". Type <strong class="cli-accent">help</strong> for valid commands.</span>`, false);
		}
	}

	function escapeHTML(str) {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function initCLI() {
		const input = document.getElementById('cli-input');
		if (input) {
			input.addEventListener('keydown', function (e) {
				if (e.key === 'Enter') {
					const val = input.value;
					input.value = '';
					handleCLICommand(val);
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					if (cmdHistory.length > 0 && historyIndex > 0) {
						historyIndex--;
						input.value = cmdHistory[historyIndex] || '';
					}
				} else if (e.key === 'ArrowDown') {
					e.preventDefault();
					if (historyIndex < cmdHistory.length - 1) {
						historyIndex++;
						input.value = cmdHistory[historyIndex] || '';
					} else {
						historyIndex = cmdHistory.length;
						input.value = '';
					}
				} else if (e.key === 'Tab') {
					e.preventDefault();
					const currentVal = input.value.trim().toLowerCase();
					if (currentVal) {
						const matches = Object.keys(CLI_COMMANDS).filter(c => c.startsWith(currentVal));
						if (matches.length === 1) {
							input.value = matches[0] + ' ';
						} else if (matches.length > 1) {
							printToCLI(`<div class="cli-dim">Matches: ${matches.join('  ')}</div>`, false);
						}
					}
				}
			});
		}

		// Global hotkey: ~ or ` key to toggle terminal
		window.addEventListener('keydown', function (e) {
			if (e.key === '`' || e.key === '~') {
				const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
				const activeId = document.activeElement ? document.activeElement.id : '';
				if ((activeTag === 'input' || activeTag === 'textarea') && activeId !== 'cli-input') {
					return;
				}
				e.preventDefault();
				window.toggleCyberCLI();
			} else if (e.key === 'Escape') {
				const modal = document.getElementById('cyber-cli-modal');
				if (modal && modal.style.display === 'flex') {
					window.closeCyberCLI();
				}
			}
		});

		// Initial banner
		printToCLI(`
<pre class="cli-banner">
  ██████╗  ██████╗ ██████╗ ███████╗███████╗
 ██╔════╝ ██╔═══██╗██╔══██╗╚══███╔╝██╔════╝
 ██║  ███╗██║   ██║██║  ██║  ███╔╝ █████╗  
 ██║   ██║██║   ██║██║  ██║ ███╔╝  ██╔══╝  
 ╚██████╔╝╚██████╔╝██████╔╝███████╗███████╗
  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
  MOHAN KUMAR K • CYBER SECURITY & DEFENSE TERMINAL
</pre>
<div>Type <span class="cli-accent">help</span> to view available system commands or <span class="cli-accent">whoami</span> to inspect bio.</div>
<div>Press <span class="cli-dim">[~]</span> or <span class="cli-dim">[ESC]</span> anytime to close this terminal.</div>
		`, false);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCLI);
	} else {
		initCLI();
	}
})();
