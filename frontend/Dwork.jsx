import React, { useState, useEffect } from "react";
import {
  Search, Copy, Database, Code, Mail, Key, Globe,
  Wifi, Check, FileText, ExternalLink, Cloud, Terminal,
  ScanLine, X, Server, Zap, Loader2,
  Activity,
} from "lucide-react";

/* ─── SEVERITY CONFIG ────────────────────────────────────────── */
const SEV = {
  critical: { bg: "#FEE2E2", text: "#991B1B", label: "Critical" },
  high:     { bg: "#FEF3C7", text: "#92400E", label: "High"     },
  medium:   { bg: "#DBEAFE", text: "#1E40AF", label: "Medium"   },
  low:      { bg: "#D1FAE5", text: "#065F46", label: "Low"      },
};

/* ─── CATEGORIES ──────────────────────────────────────────────── */
const CATS = [
  { id: "all",         label: "All",         Icon: Globe    },
  { id: "common",      label: "High Success",Icon: Zap      },
  { id: "credentials", label: "Credentials", Icon: Key      },
  { id: "database",    label: "Database",    Icon: Database },
  { id: "files",       label: "Files",       Icon: FileText },
  { id: "code",        label: "Code Leaks",  Icon: Code     },
  { id: "network",     label: "Network",     Icon: Wifi     },
  { id: "cloud",       label: "Cloud",       Icon: Cloud    },
  { id: "cms",         label: "CMS",         Icon: Server   },
  { id: "email",       label: "Paste/Email", Icon: Mail     },
  { id: "api",         label: "API / Keys",  Icon: Terminal },
];

/* ─── DORKS ──────────────────────────────────────────────────── */
const DORKS = [
  // HIGH SUCCESS / COMMON
  { id: 200, cat: "common", sev: "high",     label: "Exposed Logs",          query: 'site:{target} filetype:log allintext:password' },
  { id: 201, cat: "common", sev: "critical", label: "Firebase Secrets",      query: 'site:{target} ext:json "firebase"' },
  { id: 202, cat: "common", sev: "critical", label: "Env API Keys",          query: 'site:{target} "API_KEY=" ext:env' },
  { id: 203, cat: "common", sev: "high",     label: "SQL Backups",           query: 'site:{target} inurl:wp-content/uploads ext:sql' },
  { id: 204, cat: "common", sev: "medium",   label: "Node Modules Listing",  query: 'site:{target} intitle:"Index of" "node_modules"' },
  { id: 205, cat: "common", sev: "critical", label: "Hardcoded Passwords",   query: 'site:{target} intext:"password=" ext:php | ext:py | ext:js' },

  // CREDENTIALS
  { id:1,  cat:"credentials", sev:"critical", label:"Username Directory",      query:'intitle:"index of" "/usernames"' },
  { id:2,  cat:"credentials", sev:"critical", label:"Contacts File Exposed",   query:'intitle:"index of" "contacts.txt"' },
  { id:3,  cat:"credentials", sev:"critical", label:"Credentials XML",         query:'intitle:"index of" "credentials.xml" | "credentials.inc" | "credentials.txt"' },
  { id:4,  cat:"credentials", sev:"critical", label:"RSA Private Key",         query:'"-----BEGIN RSA PRIVATE KEY-----" ext:key' },
  { id:5,  cat:"credentials", sev:"critical", label:"FTP Users File",          query:'intitle:"index of" "/ftpusers"' },
  { id:6,  cat:"credentials", sev:"critical", label:"Tomcat Users XML",        query:'intitle:"index of" "tomcat-users.xml"' },
  { id:7,  cat:"credentials", sev:"critical", label:"/etc/passwd Exposed",     query:'intext:"root:x:0:0:root:/root:/bin/bash" inurl:*=/etc/passwd' },
  { id:8,  cat:"credentials", sev:"critical", label:"Master Password File",    query:'intitle:"index of" "/master.passwd"' },
  { id:9,  cat:"credentials", sev:"critical", label:"Credentials YML",         query:'intitle:"index of" "credentials.yml"' },
  { id:10, cat:"credentials", sev:"critical", label:"Passwords YML",           query:'intitle:"index of" "passwords.yml"' },
  { id:11, cat:"credentials", sev:"critical", label:"htpasswd Exposed",        query:'intitle:"Index of" htpasswd' },
  { id:12, cat:"credentials", sev:"critical", label:"WinLogon Default Pass",   query:'"DefaultPassword" ext:reg "[HKEY_LOCAL_MACHINESOFTWAREMicrosoftWindows NTCurrentVersionWinlogon]"' },
  { id:13, cat:"credentials", sev:"high",     label:"Bash History",            query:'intitle:index.of .bash_history' },
  { id:14, cat:"credentials", sev:"high",     label:"SH History",              query:'intitle:index.of .sh_history' },
  { id:15, cat:"credentials", sev:"high",     label:"Users SQL File",          query:'intitle:"index of" "users.sql"' },
  { id:16, cat:"credentials", sev:"high",     label:"Admin Userlist ASP",      query:'inurl:admin filetype:asp inurl:userlist' },
  { id:17, cat:"credentials", sev:"high",     label:"FileZilla Servers XML",   query:'intitle:"index of" "sitemanager.xml" | "recentservers.xml"' },
  { id:18, cat:"credentials", sev:"high",     label:"FileZilla Recent XML",    query:'"FileZilla" inurl:"recentservers.xml" -git' },
  { id:19, cat:"credentials", sev:"high",     label:"PuTTY Log Passwords",     query:'filetype:log username putty' },
  { id:20, cat:"credentials", sev:"high",     label:"Creds Text File",         query:'intitle:index.of "creds.txt"' },
  { id:21, cat:"credentials", sev:"high",     label:"Users DB File",           query:'intitle:index.of "users.db"' },
  { id:22, cat:"credentials", sev:"high",     label:"Allintext Log Usernames", query:'allintext:username filetype:log' },
  { id:23, cat:"credentials", sev:"medium",   label:"Login CSV",               query:'intitle:"index of" intext:login.csv' },
  { id:24, cat:"credentials", sev:"medium",   label:"URL-Based Login Lookup",  query:'inurl:/profile.php?lookup=1' },

  // DATABASE
  { id:25, cat:"database", sev:"critical", label:"MySQL JDBC YML/Java",       query:'jdbc:mysql://localhost:3306/ + username + password ext:yml | ext:java -git -gitlab' },
  { id:26, cat:"database", sev:"critical", label:"SQL Server JDBC",           query:'jdbc:sqlserver://localhost:1433 + username + password ext:yml | ext:java' },
  { id:27, cat:"database", sev:"critical", label:"Oracle JDBC",               query:'jdbc:oracle://localhost: + username + password ext:yml | ext:java -git -gitlab' },
  { id:28, cat:"database", sev:"critical", label:"PostgreSQL JDBC",           query:'jdbc:postgresql://localhost: + username + password ext:yml | ext:java -git -gitlab' },
  { id:29, cat:"database", sev:"critical", label:"MySQL DSN Config",          query:'"\'dsn: mysql:host=localhost;dbname=" ext:yml | ext:txt "password:"' },
  { id:30, cat:"database", sev:"critical", label:"DB Properties File",        query:'intitle:"index of" "db.properties" | "db.properties.BAK"' },
  { id:31, cat:"database", sev:"critical", label:"Spring Datasource Pass",    query:'"spring.datasource.password=" + "spring.datasource.username=" ext:properties -git -gitlab' },
  { id:32, cat:"database", sev:"critical", label:"POSTGRES Password",         query:'"POSTGRES_PASSWORD=" ext:txt | ext:cfg | ext:env | ext:ini | ext:yml | ext:sql -git -gitlab' },
  { id:33, cat:"database", sev:"critical", label:"MySQL Root Password",       query:'"MYSQL_ROOT_PASSWORD:" ext:env OR ext:yml -git' },
  { id:34, cat:"database", sev:"critical", label:"Redis Password ENV",        query:'allintext:"redis_password" ext:env' },
  { id:35, cat:"database", sev:"critical", label:"DB Env Password",           query:'intext:"db_database" ext:env intext:"db_password"' },
  { id:36, cat:"database", sev:"critical", label:"SQL Create Role Encrypted", query:'"CREATE ROLE" + "ENCRYPTED PASSWORD" ext:sql | ext:txt | ext:ini -git -gitlab' },
  { id:37, cat:"database", sev:"critical", label:"phpBB Users SQL Dump",      query:'"INSERT INTO phpbb_users" ext:sql' },
  { id:38, cat:"database", sev:"critical", label:"Insert Users SQL",          query:'"insert into users" "VALUES" ext:sql | ext:txt | ext:log | ext:env' },
  { id:39, cat:"database", sev:"high",     label:"DB Username/Password Prop", query:'"db.username" + "db.password" ext:properties' },
  { id:40, cat:"database", sev:"high",     label:"MySQL Hostname TXT",        query:'intext:DB_PASSWORD || intext:"MySQL hostname" ext:txt' },
  { id:41, cat:"database", sev:"high",     label:"DB Connection JS",          query:'intitle:"index of" "db.connection.js"' },
  { id:42, cat:"database", sev:"high",     label:"DB Config File",            query:'intitle:"index of" "db.conf"' },
  { id:43, cat:"database", sev:"high",     label:"DB INI File",               query:'intitle:"index of" "database.ini" OR "database.ini.old"' },
  { id:44, cat:"database", sev:"high",     label:"SQL Alter User",            query:'ext:sql intext:"alter user" intext:"identified by"' },
  { id:45, cat:"database", sev:"high",     label:"Oracle SQL Java",           query:'intext:jdbc:oracle filetype:java' },
  { id:46, cat:"database", sev:"high",     label:"DBCP Properties",           query:'inurl:/dbcp.properties + filetype:properties -github.com' },
  { id:47, cat:"database", sev:"medium",   label:"SQL Ext Username/Password", query:'inurl:user intitle:index of ext:sql | xls | xml | json | csv' },

  // FILES
  { id:48, cat:"files", sev:"critical", label:"ENV File Exposed",            query:'"index of" ".env"' },
  { id:49, cat:"files", sev:"critical", label:"DB Password ENV",             query:'filetype:env "DB_PASSWORD"' },
  { id:50, cat:"files", sev:"critical", label:"Secret Certificate TXT",      query:'intext:"-----BEGIN CERTIFICATE-----" ext:txt' },
  { id:51, cat:"files", sev:"critical", label:"Application Users Props",     query:'intitle:"index of" "application-users.properties" | "mgmt-users.properties" | "*standalone.xml"' },
  { id:52, cat:"files", sev:"critical", label:"Shadow File Exposed",         query:'"/etc/shadow root:$" ext:cfg OR ext:log OR ext:txt OR ext:sql -git' },
  { id:53, cat:"files", sev:"critical", label:"Private Key PEM",             query:'"BEGIN RSA PRIVATE KEY" filetype:key -github' },
  { id:54, cat:"files", sev:"critical", label:"SFTP Config JSON",            query:'intitle:"Index Of" intext:sftp-config.json' },
  { id:55, cat:"files", sev:"high",     label:"Config PHP BAK",              query:'"config.php.bak" intitle:"index of"' },
  { id:56, cat:"files", sev:"high",     label:"WP Config Save",              query:'inurl:wp-config.php.save' },
  { id:57, cat:"files", sev:"high",     label:"WP Config Backup",            query:'inurl:wp-config.bak' },
  { id:58, cat:"files", sev:"high",     label:"Password ZIP",                query:'intext:"Index of" intext:"password.zip"' },
  { id:59, cat:"files", sev:"high",     label:"Passwords XLSX",              query:'intitle:"index of" "passwords.xlsx"' },
  { id:60, cat:"files", sev:"high",     label:"FTP Password File",           query:'intitle:"index of" "ftp.passwd"' },
  { id:61, cat:"files", sev:"high",     label:"htpasswd TXT",                query:'intitle:"index of" "htpasswd.txt"' },
  { id:62, cat:"files", sev:"high",     label:"Anaconda KS Config",          query:'intitle:"index of" "anaconda-ks.cfg" | "anaconda-ks-new.cfg"' },
  { id:63, cat:"files", sev:"high",     label:"Parameters YML",              query:'intitle:"index of" "/parameters.yml*"' },
  { id:64, cat:"files", sev:"high",     label:"Log File Passwords",          query:'filetype:log intext:password after:2015 intext:@gmail.com | @yahoo.com | @hotmail.com' },
  { id:65, cat:"files", sev:"high",     label:"Password Log END_FILE",       query:'ext:log password END_FILE' },
  { id:66, cat:"files", sev:"high",     label:"FTP Config",                  query:'filetype:config inurl:web.config inurl:ftp' },
  { id:67, cat:"files", sev:"high",     label:"WS FTP INI",                  query:'inurl:ws_ftp.ini "[WS_FTP]" filetype:ini' },
  { id:68, cat:"files", sev:"high",     label:"Elixir Secrets Config",       query:'intitle:"index of" "config.exs" | "dev.exs" | "test.exs" | "prod.secret.exs"' },
  { id:69, cat:"files", sev:"high",     label:"Standalone XML Password",     query:'inurl:"standalone.xml" intext:"password>"' },
  { id:70, cat:"files", sev:"medium",   label:"Uploads Directory",           query:'intext:"index of" "uploads"' },
  { id:71, cat:"files", sev:"medium",   label:"Backup SQL Directory",        query:'inurl:/backup intitle:index of backup intext:*sql' },

  // CODE LEAKS
  { id:72, cat:"code", sev:"critical", label:"GitHub Company Password",      query:'site:github.com "{target}" password' },
  { id:73, cat:"code", sev:"critical", label:"GitHub SFTP Config",           query:'site:github.com inurl:sftp-config.json' },
  { id:74, cat:"code", sev:"critical", label:"WP Config PHP DB Pass",        query:'inurl:wp-config.php intext:DB_PASSWORD -stackoverflow -wpbeginner' },
  { id:75, cat:"code", sev:"critical", label:"WP Define DB User+Pass",       query:'"define(\'DB_USER\'," + "define(\'DB_PASSWORD\'," ext:txt' },
  { id:76, cat:"code", sev:"critical", label:"WP Auth/Nonce Keys",           query:'"define(\'SECURE_AUTH_KEY\'" + "define(\'LOGGED_IN_KEY\'" + "define(\'NONCE_KEY\'" ext:txt | ext:cfg | ext:env | ext:ini' },
  { id:77, cat:"code", sev:"critical", label:"Mailer YML Secrets",           query:'"mailer_password:" + "mailer_host:" + "mailer_user:" + "secret:" ext:yml' },
  { id:78, cat:"code", sev:"critical", label:"Jenkins XML Password Hash",    query:'filetype:xml config.xml passwordHash Jenkins' },
  { id:79, cat:"code", sev:"critical", label:"App Properties Creds",         query:'username | password inurl:resources/application.properties -github.com -gitlab' },
  { id:80, cat:"code", sev:"critical", label:"WPEngine Session DB",          query:'intext:"WPENGINE_SESSION_DB_USERNAME" || "WPENGINE_SESSION_DB_PASSWORD"' },
  { id:81, cat:"code", sev:"critical", label:"WP Private Config JSON",       query:'/_wpeprivate/config.json' },
  { id:82, cat:"code", sev:"high",     label:"Email Host Password",          query:'"EMAIL_HOST_PASSWORD" ext:yml | ext:env | ext:txt | ext:log' },
  { id:83, cat:"code", sev:"high",     label:"Settings.py Email Pass",       query:'intitle:settings.py intext:EMAIL_HOST_PASSWORD -git -stackoverflow' },
  { id:84, cat:"code", sev:"high",     label:"Trello MySQL Passwords",       query:'site:trello.com intext:mysql AND intext:password -site:developers.trello.com' },
  { id:85, cat:"code", sev:"high",     label:"Jenkins Build XML Tomcat",     query:'inurl:"build.xml" intext:"tomcat.manager.password"' },
  { id:86, cat:"code", sev:"high",     label:"Gradle Proxy Password",        query:'inurl:"gradle.properties" intext:"proxyPassword"' },
  { id:87, cat:"code", sev:"high",     label:"Git Repo Exposed",             query:'intitle:"index of" ".git"' },
  { id:88, cat:"code", sev:"high",     label:"Databases YML",                query:'inurl:"databases.yml" ext:yml password -github' },
  { id:89, cat:"code", sev:"high",     label:"VSCode Settings Exposed",      query:'intitle:"Index Of" intext:".vscode"' },
  { id:90, cat:"code", sev:"high",     label:"CakePHP Database",             query:'CakePHP inurl:database.php intext:db_password' },
  { id:91, cat:"code", sev:"high",     label:"CodeIgniter SQL Users",        query:'Codeigniter filetype:sql intext:password | pwd intext:username | uname intext: Insert into users values' },
  { id:92, cat:"code", sev:"medium",   label:"Trello Company Board",         query:'site:trello.com "{target}"' },

  // NETWORK
  { id:93,  cat:"network", sev:"critical", label:"Cisco Enable Secret",      query:'"enable secret 5" ext:txt | ext:cfg' },
  { id:94,  cat:"network", sev:"high",     label:"RCON Password CFG",        query:'"server.cfg" ext:cfg intext:"rcon_password" -git -gitlab' },
  { id:95,  cat:"network", sev:"high",     label:"Router Enable Password",   query:'"enable password" ext:cfg -git -cisco.com' },
  { id:96,  cat:"network", sev:"high",     label:"Zebra Network Config",     query:'inurl:"/zebra.conf" ext:conf -git' },
  { id:97,  cat:"network", sev:"high",     label:"ProFTPD Config",           query:'filetype:conf inurl:proftpd.conf -sample' },
  { id:98,  cat:"network", sev:"high",     label:"VNC Registry Key",         query:'ext:reg " [HKEY_CURRENT_USER\\Software\\ORL\\WinVNC3]" -git' },
  { id:99,  cat:"network", sev:"high",     label:"SSH Auth Failure Log",     query:'"authentication failure; logname=" ext:log' },
  { id:100, cat:"network", sev:"high",     label:"Cisco PCF VPN",            query:'filetype:pcf "cisco" "GroupPwd"' },
  { id:101, cat:"network", sev:"high",     label:"JunOS Password",           query:'filetype:txt $9$ JunOS' },
  { id:102, cat:"network", sev:"high",     label:"ProFTPD Password File",    query:'inurl:proftpdpasswd' },
  { id:103, cat:"network", sev:"medium",   label:"Fetchmailrc Exposed",      query:'ext:fetchmailrc' },
  { id:104, cat:"network", sev:"medium",   label:"Pastebin RCON Password",   query:'site:pastebin.com "rcon_password"' },

  // CLOUD
  { id:105, cat:"cloud", sev:"critical", label:"AWS Secret Key CSV",         query:'filetype:csv intext:"Secret access key"' },
  { id:106, cat:"cloud", sev:"critical", label:"S3 Bucket XLS Passwords",    query:'s3 site:amazonaws.com filetype:xls password' },
  { id:107, cat:"cloud", sev:"critical", label:"Azure Blob Credentials",     query:'site:*.blob.core.windows.net ext:xls | ext:xlsx (login | password | username)' },
  { id:108, cat:"cloud", sev:"critical", label:"CPanel Credentials TXT",     query:'"cpanel username" "cpanel password" ext:txt' },
  { id:109, cat:"cloud", sev:"high",     label:"Keystore Password XML",      query:'"keystorePass=" ext:xml | ext:txt -git -gitlab' },
  { id:110, cat:"cloud", sev:"high",     label:"MasterUser Password",        query:'"MasterUserPassword" ext:cfg OR ext:log OR ext:txt -git' },
  { id:111, cat:"cloud", sev:"high",     label:"Mail Password ENV",          query:'"MAIL_PASSWORD" filetype:env' },
  { id:112, cat:"cloud", sev:"high",     label:"Redis ENV Password",         query:'filetype:env intext:REDIS_PASSWORD' },
  { id:113, cat:"cloud", sev:"high",     label:"Rabbit/Service Password",    query:'intext:"rabbit_password" | "service_password" filetype:conf' },
  { id:114, cat:"cloud", sev:"high",     label:"Cloudshark Packet Capture",  query:'site:cloudshark.org/captures# password' },
  { id:115, cat:"cloud", sev:"medium",   label:"Shodan Password Search",     query:'inurl:password site:shodan.io' },

  // CMS
  { id:116, cat:"cms", sev:"critical", label:"WP Uploads Passwords TXT",     query:'inurl:/wp-content/uploads/ ext:txt "username" AND "password" | "pwd" | "pw"' },
  { id:117, cat:"cms", sev:"critical", label:"WP Config Backup TXT",         query:'inurl:wp-config-backup.txt' },
  { id:118, cat:"cms", sev:"critical", label:"WP Config PHP",                query:'inurl:wp-config.php intext:DB_PASSWORD' },
  { id:119, cat:"cms", sev:"high",     label:"WP Uploads XLS Passwords",     query:'inurl:wp-content/uploads filetype:xls | filetype:xlsx password' },
  { id:120, cat:"cms", sev:"high",     label:"WP License File Traversal",    query:'inurl:"wp-license.php?file=../..//wp-config"' },
  { id:121, cat:"cms", sev:"high",     label:"WP Helpdesk Default Pass",     query:'inurl:*helpdesk* intext:"your default password is"' },
  { id:122, cat:"cms", sev:"high",     label:"Joomla DB Password",           query:'inurl:configuration.php and intext:"var $password="' },
  { id:123, cat:"cms", sev:"high",     label:"Typo3 Config",                 query:'inurl:typo3conf/localconf.php' },
  { id:124, cat:"cms", sev:"high",     label:"WPEngine Session DB",          query:'intext:"WPENGINE_SESSION_DB_USERNAME" || "WPENGINE_SESSION_DB_PASSWORD"' },

  // PASTE / EMAIL
  { id:125, cat:"email", sev:"high",   label:"Pastebin Admin Password",      query:'site:pastebin.com "admin password"' },
  { id:126, cat:"email", sev:"high",   label:"Pastebin Username",            query:'site:pastebin.com intext:Username' },
  { id:127, cat:"email", sev:"high",   label:"Pastebin Password TXT",        query:'site:pastebin.com intext:pass.txt' },
  { id:128, cat:"email", sev:"high",   label:"Pastebin Secret Keys",         query:'site:pastebin.com intext:username | password | SECRET_KEY' },
  { id:129, cat:"email", sev:"high",   label:"Pastebin Admin Password 2021", query:'site:pastebin.com intitle:"password" 2021' },
  { id:130, cat:"email", sev:"high",   label:"Rentry Passwords",             query:'site:rentry.co intext:"password"' },
  { id:131, cat:"email", sev:"high",   label:"ControlC Passwords",           query:'site:controlc.com intext:"password"' },
  { id:132, cat:"email", sev:"high",   label:"Ghostbin Password",            query:'intext:"password" | "passwd" | "pwd" site:ghostbin.com' },
  { id:133, cat:"email", sev:"high",   label:"Target on Pastebin",           query:'site:pastebin.com "{target}"' },
  { id:134, cat:"email", sev:"medium", label:"Gmail Accounts XLSX",          query:'allintext:"*.@gmail.com" OR "password" OR "username" filetype:xlsx' },
  { id:135, cat:"email", sev:"medium", label:"Email Password Log Gmail",     query:'filetype:log intext:password after:2015 intext:@gmail.com' },
  { id:136, cat:"email", sev:"medium", label:"Yahoo Email TXT",              query:'ext:txt intext:@yahoo.com intext:password' },
  { id:137, cat:"email", sev:"medium", label:"Email XLS Credentials",        query:'ext:xls intext:@gmail.com intext:password' },

  // API / KEYS
  { id:138, cat:"api", sev:"critical", label:"PHP MySQL Bak Connect",        query:'filetype:bak inurl:php "mysql_connect"' },
  { id:139, cat:"api", sev:"critical", label:"PHP MySQL Include",            query:'filetype:inc OR filetype:bak OR filetype:old mysql_connect OR mysql_pconnect' },
  { id:140, cat:"api", sev:"critical", label:"Public Class Secrets",         query:'"public $user =" | "public $password = " | "public $secret =" | "public $db =" ext:txt | ext:log -git' },
  { id:141, cat:"api", sev:"critical", label:"Keylogger Password Log",       query:'"iSpy Keylogger" "Passwords Log" ext:txt' },
  { id:142, cat:"api", sev:"critical", label:"FTP XLS Login Password",       query:'inurl:"ftp" intext:"user" | "username" intext:"password" | "passcode" filetype:xls | filetype:xlsx' },
  { id:143, cat:"api", sev:"high",     label:"FrontPage PWD File",           query:'"# -FrontPage-" ext:pwd inurl:(service | authors | administrators | users) "# -FrontPage-" inurl:service.pwd' },
  { id:144, cat:"api", sev:"high",     label:"jmxremote Password",           query:'filetype:password jmxremote' },
  { id:145, cat:"api", sev:"high",     label:"Web Config Password",          query:'"Password=" inurl:web.config -intext:web.config ext:config' },
  { id:146, cat:"api", sev:"high",     label:"SMTP Login XLS",               query:'intext:smtp | pop3 intext:login | logon intext:password | passcode filetype:xls | filetype:xlsx' },
  { id:147, cat:"api", sev:"high",     label:"Stealer Output TXT",           query:'"End Stealer " ext:txt' },
  { id:148, cat:"api", sev:"high",     label:"Stealer W33DY Output",         query:'"username stealer by W33DY" ext:txt' },
  { id:149, cat:"api", sev:"high",     label:"Steam User Passphrase",        query:'intext:"SteamUserPassphrase=" intext:"SteamAppUser="' },
  { id:150, cat:"api", sev:"medium",   label:"XLS NAME TEL EMAIL PASS",      query:'ext:xls intext:NAME intext:TEL intext:EMAIL intext:PASSWORD' },
];

/* ─── COMPONENT ───────────────────────────────────────────────── */
export default function Dwork() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  const [target, setTarget]       = useState("");
  const [cat, setCat]             = useState("all");
  const [scanning, setScanning]   = useState(null);
  const [scanResults, setScanResults] = useState({});
  const [logs, setLogs]           = useState({});

  const addLog = (id, msg) =>
    setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), `> ${msg}`] }));

  const resolve = (text) =>
    target ? text.replace(/\{target\}/g, target) : text;

  const runAutoScan = async (dork) => {
    const query = resolve(dork.query);
    setScanning(dork.id);
    setLogs(prev => ({ ...prev, [dork.id]: ["Initialising scan..."] }));
    setScanResults(prev => ({ ...prev, [dork.id]: null }));

    try {
      // FIX: use VITE_API_BASE_URL (matches README + Vercel env var name)
      // In dev: empty string → relative URL → Vite proxy forwards to localhost:8080
      // In prod: full Render URL → direct call to backend
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
      const endpoint = `${baseUrl}/api/auto-scan`;

      addLog(dork.id, `POST ${endpoint}`);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // FIX: include x-api-key as required by backend middleware
          "x-api-key": import.meta.env.VITE_API_KEY || "",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (data.success) {
        addLog(dork.id, `Done — ${data.results.length} result(s) found.`);
        setScanResults(prev => ({ ...prev, [dork.id]: data.results }));
      }
    } catch (err) {
      addLog(dork.id, `ERROR: ${err.message}`);
      setScanResults(prev => ({ ...prev, [dork.id]: [] }));
    } finally {
      setScanning(null);
    }
  };

  const filtered = DORKS.filter(d => cat === "all" || d.cat === cat);

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        padding: "15px 20px",
        borderBottom: "1px solid #E5E7EB",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
          }}>
            <ScanLine size={18} color="#fff" />
          </div>
          <b style={{ fontSize: 22, letterSpacing: "-0.5px" }}>
            Dwork<span style={{ color: "#3B82F6" }}>.</span>
          </b>
        </div>
        <Activity size={18} color="#1D4ED8" />
      </header>

      <div style={{ padding: "24px 0 60px" }}>

        {/* ── TARGET INPUT ── */}
        <div style={{ padding: "0 16px", marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="Enter target — domain, company, or person..."
              style={{
                width: "100%", padding: "16px 44px 16px 44px",
                borderRadius: 16, border: "2px solid #E5E7EB",
                fontSize: 15, fontFamily: "'Outfit', sans-serif",
                outline: "none", background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
              onFocus={e => e.target.style.borderColor = "#3B82F6"}
              onBlur={e => e.target.style.borderColor = "#E5E7EB"}
            />
            {target && (
              <button onClick={() => setTarget("")} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "#F3F4F6", border: "none", borderRadius: 8,
                width: 26, height: 26, cursor: "pointer", color: "#6B7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={13} />
              </button>
            )}
          </div>
          {target && (
            <div style={{
              marginTop: 10, padding: "8px 14px",
              background: "#EFF6FF", borderRadius: 10,
              fontSize: 12, color: "#1D4ED8", fontWeight: 600,
              border: "1px solid #BFDBFE",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Zap size={12} />
              Dorks with &#123;target&#125; will run as: <strong>{target}</strong>
            </div>
          )}
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={{ overflowX: "auto", padding: "0 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, width: "max-content" }}>
            {CATS.map(c => {
              const active = cat === c.id;
              const count  = c.id === "all" ? DORKS.length : DORKS.filter(d => d.cat === c.id).length;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 16px",
                  background: active ? "#1D4ED8" : "#fff",
                  color: active ? "#fff" : "#374151",
                  border: active ? "2px solid #1D4ED8" : "2px solid #E5E7EB",
                  borderRadius: 40, fontSize: 13, fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: active ? "0 4px 12px rgba(29,78,216,0.25)" : "none",
                }}>
                  <c.Icon size={13} strokeWidth={2.5} />
                  {c.label}
                  <span style={{
                    background: active ? "rgba(255,255,255,0.25)" : "#F3F4F6",
                    color: active ? "#fff" : "#9CA3AF",
                    fontSize: 11, fontWeight: 700,
                    padding: "1px 6px", borderRadius: 10,
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DORK CARDS ── */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(d => {
            const s         = SEV[d.sev];
            const isRunning = scanning === d.id;
            const results   = scanResults[d.id];
            const resolvedQ = resolve(d.query);

            return (
              <div key={d.id} style={{
                background: "#fff", borderRadius: 20, padding: 18,
                border: "1px solid #F0F0F3",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}>
                {/* Label + severity */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111", flex: 1, paddingRight: 8 }}>{d.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 9px",
                    borderRadius: 20, background: s.bg, color: s.text,
                    whiteSpace: "nowrap", letterSpacing: "0.4px",
                  }}>{s.label.toUpperCase()}</span>
                </div>

                {/* Query */}
                <div style={{
                  background: "#F8F8FA", borderRadius: 10, padding: "9px 12px",
                  fontSize: 11, fontFamily: "'SF Mono', 'Fira Code', monospace",
                  color: "#374151", wordBreak: "break-all", lineHeight: 1.6,
                  marginBottom: 12, border: "1px solid #EDEDF0",
                }}>
                  {resolvedQ}
                </div>

                {/* Log terminal */}
                {logs[d.id] && (
                  <div style={{
                    background: "#0F172A", color: "#22D3EE",
                    padding: 12, borderRadius: 12, fontSize: 11,
                    fontFamily: "'SF Mono', monospace",
                    maxHeight: 100, overflowY: "auto",
                    marginBottom: 12, border: "1px solid #1E293B",
                  }}>
                    {logs[d.id].map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                )}

                {/* Execute button */}
                <button
                  onClick={() => runAutoScan(d)}
                  disabled={isRunning}
                  style={{
                    width: "100%", padding: "14px",
                    background: isRunning ? "#93C5FD" : "#1D4ED8",
                    color: "#fff", borderRadius: 14, border: "none",
                    fontWeight: 800, fontSize: 13,
                    fontFamily: "'Outfit', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    cursor: isRunning ? "not-allowed" : "pointer",
                    letterSpacing: "0.5px",
                  }}>
                  {isRunning
                    ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    : <Zap size={16} />}
                  {isRunning ? "SCANNING..." : "EXECUTE SCAN"}
                </button>

                {/* Results */}
                {results !== null && results !== undefined && (
                  <div style={{ marginTop: 16, borderTop: "1.5px dashed #F1F5F9", paddingTop: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 900, color: "#1D4ED8", marginBottom: 10, letterSpacing: "0.8px" }}>
                      {results.length > 0 ? `${results.length} RESULT(S) FOUND` : "NO RESULTS"}
                    </p>
                    {results.length > 0 ? results.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noreferrer" style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 12, color: "#EF4444", textDecoration: "none",
                        background: "#FEF2F2", padding: "10px 12px",
                        borderRadius: 10, border: "1px solid #FEE2E2",
                        marginBottom: 8, wordBreak: "break-all",
                      }}>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                        {link}
                      </a>
                    )) : (
                      <p style={{ fontSize: 12, color: "#94A3B8" }}>Clean — no leaks detected for this dork.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: "1px solid #E8E8EC", padding: "14px 20px",
        background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.3px" }}>
          Dwork<span style={{ color: "#3B82F6" }}>.</span>
        </span>
        <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>
          Private · Authorized use only
        </span>
      </div>
    </div>
  );
}
