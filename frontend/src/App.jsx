import { useState, useEffect } from "react";
import {
  Search, Copy, Shield, Database, Code, Mail, Key, Globe,
  Wifi, Check, FileText, ExternalLink, Cloud, Terminal,
  ScanLine, Filter, X, Lock, Server, Zap
} from "lucide-react";

/* ─── SEVERITY ────────────────────────────────────────────────── */
const SEV = {
  critical: { dot: "#EF4444", bg: "#FFF1F2", text: "#B91C1C", label: "Critical" },
  high:     { dot: "#F59E0B", bg: "#FFFBEB", text: "#B45309", label: "High"     },
  medium:   { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", label: "Medium"   },
  low:      { dot: "#10B981", bg: "#F0FDF4", text: "#065F46", label: "Low"      },
};

/* ─── CATEGORIES ──────────────────────────────────────────────── */
const CATS = [
  { id: "all",         label: "All",         Icon: Globe    },
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

/* ─── DORKS ───────────────────────────────────────────────────── */
const DORKS = [
  // CREDENTIALS ────────────────────────────────────────────────
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

  // DATABASE ───────────────────────────────────────────────────
  { id:25, cat:"database", sev:"critical", label:"MySQL JDBC YML/Java",      query:'jdbc:mysql://localhost:3306/ + username + password ext:yml | ext:java -git -gitlab' },
  { id:26, cat:"database", sev:"critical", label:"SQL Server JDBC",          query:'jdbc:sqlserver://localhost:1433 + username + password ext:yml | ext:java' },
  { id:27, cat:"database", sev:"critical", label:"Oracle JDBC",              query:'jdbc:oracle://localhost: + username + password ext:yml | ext:java -git -gitlab' },
  { id:28, cat:"database", sev:"critical", label:"PostgreSQL JDBC",          query:'jdbc:postgresql://localhost: + username + password ext:yml | ext:java -git -gitlab' },
  { id:29, cat:"database", sev:"critical", label:"MySQL DSN Config",         query:'"\'dsn: mysql:host=localhost;dbname=" ext:yml | ext:txt "password:"' },
  { id:30, cat:"database", sev:"critical", label:"DB Properties File",       query:'intitle:"index of" "db.properties" | "db.properties.BAK"' },
  { id:31, cat:"database", sev:"critical", label:"Spring Datasource Pass",   query:'"spring.datasource.password=" + "spring.datasource.username=" ext:properties -git -gitlab' },
  { id:32, cat:"database", sev:"critical", label:"POSTGRES Password",        query:'"POSTGRES_PASSWORD=" ext:txt | ext:cfg | ext:env | ext:ini | ext:yml | ext:sql -git -gitlab' },
  { id:33, cat:"database", sev:"critical", label:"MySQL Root Password",      query:'"MYSQL_ROOT_PASSWORD:" ext:env OR ext:yml -git' },
  { id:34, cat:"database", sev:"critical", label:"Redis Password ENV",       query:'allintext:"redis_password" ext:env' },
  { id:35, cat:"database", sev:"critical", label:"DB Env Password",          query:'intext:"db_database" ext:env intext:"db_password"' },
  { id:36, cat:"database", sev:"critical", label:"SQL Create Role Encrypted",query:'"CREATE ROLE" + "ENCRYPTED PASSWORD" ext:sql | ext:txt | ext:ini -git -gitlab' },
  { id:37, cat:"database", sev:"critical", label:"phpBB Users SQL Dump",     query:'"INSERT INTO phpbb_users" ext:sql' },
  { id:38, cat:"database", sev:"critical", label:"Insert Users SQL",         query:'"insert into users" "VALUES" ext:sql | ext:txt | ext:log | ext:env' },
  { id:39, cat:"database", sev:"high",     label:"DB Username/Password Prop",query:'"db.username" + "db.password" ext:properties' },
  { id:40, cat:"database", sev:"high",     label:"MySQL Hostname TXT",       query:'intext:DB_PASSWORD || intext:"MySQL hostname" ext:txt' },
  { id:41, cat:"database", sev:"high",     label:"DB Connection JS",         query:'intitle:"index of" "db.connection.js"' },
  { id:42, cat:"database", sev:"high",     label:"DB Config File",           query:'intitle:"index of" "db.conf"' },
  { id:43, cat:"database", sev:"high",     label:"DB INI File",              query:'intitle:"index of" "database.ini" OR "database.ini.old"' },
  { id:44, cat:"database", sev:"high",     label:"SQL Alter User",           query:'ext:sql intext:"alter user" intext:"identified by"' },
  { id:45, cat:"database", sev:"high",     label:"Oracle SQL Java",          query:'intext:jdbc:oracle filetype:java' },
  { id:46, cat:"database", sev:"high",     label:"DBCP Properties",          query:'inurl:/dbcp.properties + filetype:properties -github.com' },
  { id:47, cat:"database", sev:"medium",   label:"SQL Ext Username/Password",query:'inurl:user intitle:index of ext:sql | xls | xml | json | csv' },

  // FILES ──────────────────────────────────────────────────────
  { id:48, cat:"files", sev:"critical", label:"ENV File Exposed",           query:'"index of" ".env"' },
  { id:49, cat:"files", sev:"critical", label:"DB Password ENV",            query:'filetype:env "DB_PASSWORD"' },
  { id:50, cat:"files", sev:"critical", label:"Secret Certificate TXT",     query:'intext:"-----BEGIN CERTIFICATE-----" ext:txt' },
  { id:51, cat:"files", sev:"critical", label:"Application Users Props",    query:'intitle:"index of" "application-users.properties" | "mgmt-users.properties" | "*standalone.xml"' },
  { id:52, cat:"files", sev:"critical", label:"Shadow File Exposed",        query:'"/etc/shadow root:$" ext:cfg OR ext:log OR ext:txt OR ext:sql -git' },
  { id:53, cat:"files", sev:"critical", label:"Private Key PEM",            query:'"BEGIN RSA PRIVATE KEY" filetype:key -github' },
  { id:54, cat:"files", sev:"critical", label:"SFTP Config JSON",           query:'intitle:"Index Of" intext:sftp-config.json' },
  { id:55, cat:"files", sev:"high",     label:"Config PHP BAK",             query:'"config.php.bak" intitle:"index of"' },
  { id:56, cat:"files", sev:"high",     label:"WP Config Save",             query:'inurl:wp-config.php.save' },
  { id:57, cat:"files", sev:"high",     label:"WP Config Backup",           query:'inurl:wp-config.bak' },
  { id:58, cat:"files", sev:"high",     label:"Password ZIP",               query:'intext:"Index of" intext:"password.zip"' },
  { id:59, cat:"files", sev:"high",     label:"Passwords XLSX",             query:'intitle:"index of" "passwords.xlsx"' },
  { id:60, cat:"files", sev:"high",     label:"FTP Password File",          query:'intitle:"index of" "ftp.passwd"' },
  { id:61, cat:"files", sev:"high",     label:"htpasswd TXT",               query:'intitle:"index of" "htpasswd.txt"' },
  { id:62, cat:"files", sev:"high",     label:"Anaconda KS Config",         query:'intitle:"index of" "anaconda-ks.cfg" | "anaconda-ks-new.cfg"' },
  { id:63, cat:"files", sev:"high",     label:"Parameters YML",             query:'intitle:"index of" "/parameters.yml*"' },
  { id:64, cat:"files", sev:"high",     label:"Log File Passwords",         query:'filetype:log intext:password after:2015 intext:@gmail.com | @yahoo.com | @hotmail.com' },
  { id:65, cat:"files", sev:"high",     label:"Password Log END_FILE",      query:'ext:log password END_FILE' },
  { id:66, cat:"files", sev:"high",     label:"FTP Config",                 query:'filetype:config inurl:web.config inurl:ftp' },
  { id:67, cat:"files", sev:"high",     label:"WS FTP INI",                 query:'inurl:ws_ftp.ini "[WS_FTP]" filetype:ini' },
  { id:68, cat:"files", sev:"high",     label:"Elixir Secrets Config",      query:'intitle:"index of" "config.exs" | "dev.exs" | "test.exs" | "prod.secret.exs"' },
  { id:69, cat:"files", sev:"high",     label:"Standalone XML Password",    query:'inurl:"standalone.xml" intext:"password>"' },
  { id:70, cat:"files", sev:"medium",   label:"Uploads Directory",          query:'intext:"index of" "uploads"' },
  { id:71, cat:"files", sev:"medium",   label:"Backup SQL Directory",       query:'inurl:/backup intitle:index of backup intext:*sql' },

  // CODE LEAKS ─────────────────────────────────────────────────
  { id:72, cat:"code", sev:"critical", label:"GitHub Company Password",     query:'site:github.com "{target}" password' },
  { id:73, cat:"code", sev:"critical", label:"GitHub SFTP Config",          query:'site:github.com inurl:sftp-config.json' },
  { id:74, cat:"code", sev:"critical", label:"WP Config PHP DB Pass",       query:'inurl:wp-config.php intext:DB_PASSWORD -stackoverflow -wpbeginner' },
  { id:75, cat:"code", sev:"critical", label:"WP Define DB User+Pass",      query:'"define(\'DB_USER\'," + "define(\'DB_PASSWORD\'," ext:txt' },
  { id:76, cat:"code", sev:"critical", label:"WP Auth/Nonce Keys",          query:'"define(\'SECURE_AUTH_KEY\'" + "define(\'LOGGED_IN_KEY\'" + "define(\'NONCE_KEY\'" ext:txt | ext:cfg | ext:env | ext:ini' },
  { id:77, cat:"code", sev:"critical", label:"Mailer YML Secrets",          query:'"mailer_password:" + "mailer_host:" + "mailer_user:" + "secret:" ext:yml' },
  { id:78, cat:"code", sev:"critical", label:"Jenkins XML Password Hash",   query:'filetype:xml config.xml passwordHash Jenkins' },
  { id:79, cat:"code", sev:"critical", label:"App Properties Creds",        query:'username | password inurl:resources/application.properties -github.com -gitlab' },
  { id:80, cat:"code", sev:"critical", label:"WPEngine Session DB",         query:'intext:"WPENGINE_SESSION_DB_USERNAME" || "WPENGINE_SESSION_DB_PASSWORD"' },
  { id:81, cat:"code", sev:"critical", label:"WP Private Config JSON",      query:'/_wpeprivate/config.json' },
  { id:82, cat:"code", sev:"high",     label:"Email Host Password",         query:'"EMAIL_HOST_PASSWORD" ext:yml | ext:env | ext:txt | ext:log' },
  { id:83, cat:"code", sev:"high",     label:"Settings.py Email Pass",      query:'intitle:settings.py intext:EMAIL_HOST_PASSWORD -git -stackoverflow' },
  { id:84, cat:"code", sev:"high",     label:"Trello MySQL Passwords",      query:'site:trello.com intext:mysql AND intext:password -site:developers.trello.com' },
  { id:85, cat:"code", sev:"high",     label:"Jenkins Build XML Tomcat",    query:'inurl:"build.xml" intext:"tomcat.manager.password"' },
  { id:86, cat:"code", sev:"high",     label:"Gradle Proxy Password",       query:'inurl:"gradle.properties" intext:"proxyPassword"' },
  { id:87, cat:"code", sev:"high",     label:"Git Repo Exposed",            query:'intitle:"index of" ".git"' },
  { id:88, cat:"code", sev:"high",     label:"Databases YML",               query:'inurl:"databases.yml" ext:yml password -github' },
  { id:89, cat:"code", sev:"high",     label:"VSCode Settings Exposed",     query:'intitle:"Index Of" intext:".vscode"' },
  { id:90, cat:"code", sev:"high",     label:"CakePHP Database",            query:'CakePHP inurl:database.php intext:db_password' },
  { id:91, cat:"code", sev:"high",     label:"CodeIgniter SQL Users",       query:'Codeigniter filetype:sql intext:password | pwd intext:username | uname intext: Insert into users values' },
  { id:92, cat:"code", sev:"medium",   label:"Trello Company Board",        query:'site:trello.com "{target}"' },

  // NETWORK ────────────────────────────────────────────────────
  { id:93,  cat:"network", sev:"critical", label:"Cisco Enable Secret",     query:'"enable secret 5" ext:txt | ext:cfg' },
  { id:94,  cat:"network", sev:"high",     label:"RCON Password CFG",       query:'"server.cfg" ext:cfg intext:"rcon_password" -git -gitlab' },
  { id:95,  cat:"network", sev:"high",     label:"Router Enable Password",  query:'"enable password" ext:cfg -git -cisco.com' },
  { id:96,  cat:"network", sev:"high",     label:"Zebra Network Config",    query:'inurl:"/zebra.conf" ext:conf -git' },
  { id:97,  cat:"network", sev:"high",     label:"ProFTPD Config",          query:'filetype:conf inurl:proftpd.conf -sample' },
  { id:98,  cat:"network", sev:"high",     label:"VNC Registry Key",        query:'ext:reg " [HKEY_CURRENT_USER\\Software\\ORL\\WinVNC3]" -git' },
  { id:99,  cat:"network", sev:"high",     label:"SSH Auth Failure Log",    query:'"authentication failure; logname=" ext:log' },
  { id:100, cat:"network", sev:"high",     label:"Cisco PCF VPN",           query:'filetype:pcf "cisco" "GroupPwd"' },
  { id:101, cat:"network", sev:"high",     label:"JunOS Password",          query:'filetype:txt $9$ JunOS' },
  { id:102, cat:"network", sev:"high",     label:"ProFTPD Password File",   query:'inurl:proftpdpasswd' },
  { id:103, cat:"network", sev:"medium",   label:"Fetchmailrc Exposed",     query:'ext:fetchmailrc' },
  { id:104, cat:"network", sev:"medium",   label:"Pastebin RCON Password",  query:'site:pastebin.com "rcon_password"' },

  // CLOUD ──────────────────────────────────────────────────────
  { id:105, cat:"cloud", sev:"critical", label:"AWS Secret Key CSV",        query:'filetype:csv intext:"Secret access key"' },
  { id:106, cat:"cloud", sev:"critical", label:"S3 Bucket XLS Passwords",   query:'s3 site:amazonaws.com filetype:xls password' },
  { id:107, cat:"cloud", sev:"critical", label:"Azure Blob Credentials",    query:'site:*.blob.core.windows.net ext:xls | ext:xlsx (login | password | username)' },
  { id:108, cat:"cloud", sev:"critical", label:"CPanel Credentials TXT",    query:'"cpanel username" "cpanel password" ext:txt' },
  { id:109, cat:"cloud", sev:"high",     label:"Keystore Password XML",     query:'"keystorePass=" ext:xml | ext:txt -git -gitlab' },
  { id:110, cat:"cloud", sev:"high",     label:"MasterUser Password",       query:'"MasterUserPassword" ext:cfg OR ext:log OR ext:txt -git' },
  { id:111, cat:"cloud", sev:"high",     label:"Mail Password ENV",         query:'"MAIL_PASSWORD" filetype:env' },
  { id:112, cat:"cloud", sev:"high",     label:"Redis ENV Password",        query:'filetype:env intext:REDIS_PASSWORD' },
  { id:113, cat:"cloud", sev:"high",     label:"Rabbit/Service Password",   query:'intext:"rabbit_password" | "service_password" filetype:conf' },
  { id:114, cat:"cloud", sev:"high",     label:"Cloudshark Packet Capture", query:'site:cloudshark.org/captures# password' },
  { id:115, cat:"cloud", sev:"medium",   label:"Shodan Password Search",    query:'inurl:password site:shodan.io' },

  // CMS ────────────────────────────────────────────────────────
  { id:116, cat:"cms", sev:"critical", label:"WP Uploads Passwords TXT",    query:'inurl:/wp-content/uploads/ ext:txt "username" AND "password" | "pwd" | "pw"' },
  { id:117, cat:"cms", sev:"critical", label:"WP Config Backup TXT",        query:'inurl:wp-config-backup.txt' },
  { id:118, cat:"cms", sev:"critical", label:"WP Config PHP",               query:'inurl:wp-config-backup.txt' },
  { id:119, cat:"cms", sev:"high",     label:"WP Uploads XLS Passwords",    query:'inurl:wp-content/uploads filetype:xls | filetype:xlsx password' },
  { id:120, cat:"cms", sev:"high",     label:"WP License File Traversal",   query:'inurl:"wp-license.php?file=../..//wp-config"' },
  { id:121, cat:"cms", sev:"high",     label:"WP Helpdesk Default Pass",    query:'inurl:*helpdesk* intext:"your default password is"' },
  { id:122, cat:"cms", sev:"high",     label:"Joomla DB Password",          query:'inurl:configuration.php and intext:"var $password="' },
  { id:123, cat:"cms", sev:"high",     label:"Typo3 Config",                query:'inurl:typo3conf/localconf.php' },
  { id:124, cat:"cms", sev:"high",     label:"WPEngine Session DB",         query:'intext:"WPENGINE_SESSION_DB_USERNAME" || "WPENGINE_SESSION_DB_PASSWORD"' },

  // PASTE / EMAIL ──────────────────────────────────────────────
  { id:125, cat:"email", sev:"high",   label:"Pastebin Admin Password",     query:'site:pastebin.com "admin password"' },
  { id:126, cat:"email", sev:"high",   label:"Pastebin Username",           query:'site:pastebin.com intext:Username' },
  { id:127, cat:"email", sev:"high",   label:"Pastebin Password TXT",       query:'site:pastebin.com intext:pass.txt' },
  { id:128, cat:"email", sev:"high",   label:"Pastebin Secret Keys",        query:'site:pastebin.com intext:username | password | SECRET_KEY' },
  { id:129, cat:"email", sev:"high",   label:"Pastebin Admin Password 2021",query:'site:pastebin.com intitle:"password" 2021' },
  { id:130, cat:"email", sev:"high",   label:"Rentry Passwords",            query:'site:rentry.co intext:"password"' },
  { id:131, cat:"email", sev:"high",   label:"ControlC Passwords",          query:'site:controlc.com intext:"password"' },
  { id:132, cat:"email", sev:"high",   label:"Ghostbin Password",           query:'intext:"password" | "passwd" | "pwd" site:ghostbin.com' },
  { id:133, cat:"email", sev:"high",   label:"Target on Pastebin",          query:'site:pastebin.com "{target}"' },
  { id:134, cat:"email", sev:"medium", label:"Gmail Accounts XLSX",         query:'allintext:"*.@gmail.com" OR "password" OR "username" filetype:xlsx' },
  { id:135, cat:"email", sev:"medium", label:"Email Password Log Gmail",    query:'filetype:log intext:password after:2015 intext:@gmail.com' },
  { id:136, cat:"email", sev:"medium", label:"Yahoo Email TXT",             query:'ext:txt intext:@yahoo.com intext:password' },
  { id:137, cat:"email", sev:"medium", label:"Email XLS Credentials",       query:'ext:xls intext:@gmail.com intext:password' },

  // API / KEYS ─────────────────────────────────────────────────
  { id:138, cat:"api", sev:"critical", label:"PHP MySQL Bak Connect",       query:'filetype:bak inurl:php "mysql_connect"' },
  { id:139, cat:"api", sev:"critical", label:"PHP MySQL Include",           query:'filetype:inc OR filetype:bak OR filetype:old mysql_connect OR mysql_pconnect' },
  { id:140, cat:"api", sev:"critical", label:"Public Class Secrets",        query:'"public $user =" | "public $password = " | "public $secret =" | "public $db =" ext:txt | ext:log -git' },
  { id:141, cat:"api", sev:"critical", label:"Keylogger Password Log",      query:'"iSpy Keylogger" "Passwords Log" ext:txt' },
  { id:142, cat:"api", sev:"critical", label:"FTP XLS Login Password",      query:'inurl:"ftp" intext:"user" | "username" intext:"password" | "passcode" filetype:xls | filetype:xlsx' },
  { id:143, cat:"api", sev:"high",     label:"FrontPage PWD File",          query:'"# -FrontPage-" ext:pwd inurl:(service | authors | administrators | users) "# -FrontPage-" inurl:service.pwd' },
  { id:144, cat:"api", sev:"high",     label:"jmxremote Password",          query:'filetype:password jmxremote' },
  { id:145, cat:"api", sev:"high",     label:"Web Config Password",         query:'"Password=" inurl:web.config -intext:web.config ext:config' },
  { id:146, cat:"api", sev:"high",     label:"SMTP Login XLS",              query:'intext:smtp | pop3 intext:login | logon intext:password | passcode filetype:xls | filetype:xlsx' },
  { id:147, cat:"api", sev:"high",     label:"Stealer Output TXT",          query:'"End Stealer " ext:txt' },
  { id:148, cat:"api", sev:"high",     label:"Stealer W33DY Output",        query:'"Stealer by W33DY" ext:txt' },
  { id:149, cat:"api", sev:"high",     label:"Steam User Passphrase",       query:'intext:"SteamUserPassphrase=" intext:"SteamAppUser="' },
  { id:150, cat:"api", sev:"medium",   label:"XLS NAME TEL EMAIL PASS",     query:'ext:xls intext:NAME intext:TEL intext:EMAIL intext:PASSWORD' },
];

/* ─── COMPONENT ───────────────────────────────────────────────── */
export default function Dwork() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  const [target, setTarget] = useState("");
  const [cat, setCat]       = useState("all");
  const [sev, setSev]       = useState("all");
  const [q, setQ]           = useState("");
  const [copied, setCopied] = useState(null);

  const resolve = (text) => target ? text.replace(/\{target\}/g, target) : text;

  const copy = (text, id) => {
    navigator.clipboard.writeText(resolve(text));
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const openSearch = (text) =>
    window.open(`https://www.google.com/search?q=${encodeURIComponent(resolve(text))}`, "_blank");

  const filtered = DORKS.filter(d =>
    (cat === "all" || d.cat === cat) &&
    (sev === "all" || d.sev === sev) &&
    (!q || d.label.toLowerCase().includes(q.toLowerCase()) || d.query.toLowerCase().includes(q.toLowerCase()))
  );

  const counts = Object.fromEntries(CATS.map(c => [
    c.id, c.id === "all" ? DORKS.length : DORKS.filter(d => d.cat === c.id).length
  ]));

  const critCount = DORKS.filter(d => d.sev === "critical").length;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#F5F5F7", minHeight: "100vh", color: "#111" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #E8E8EC",
        padding: "0 20px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
          }}>
            <ScanLine size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
            Dwork<span style={{ color: "#3B82F6" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{
            background: "#FEE2E2", color: "#B91C1C",
            fontSize: 11, fontWeight: 700, padding: "3px 9px",
            borderRadius: 20, letterSpacing: "0.3px"
          }}>
            {critCount} CRITICAL
          </span>
          <span style={{
            background: "#EFF6FF", color: "#1D4ED8",
            fontSize: 11, fontWeight: 700, padding: "3px 9px",
            borderRadius: 20, letterSpacing: "0.3px"
          }}>
            {DORKS.length} DORKS
          </span>
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", letterSpacing: "1.2px", marginBottom: 6 }}>
          OSINT EXPOSURE SCANNER
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 18px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          Find what's<br />
          <span style={{ color: "#3B82F6" }}>leaking</span> before they do.
        </h1>

        {/* Target input */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            color: "#9CA3AF",
          }}>
            <Target size={16} />
          </div>
          <input
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="Enter target (company / domain / person)..."
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "14px 16px 14px 44px",
              background: "#fff",
              border: "2px solid #E5E7EB",
              borderRadius: 16,
              fontSize: 15,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              outline: "none",
              transition: "border-color 0.15s",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            onFocus={e => e.target.style.borderColor = "#3B82F6"}
            onBlur={e => e.target.style.borderColor = "#E5E7EB"}
          />
          {target && (
            <button onClick={() => setTarget("")} style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "#F3F4F6", border: "none", borderRadius: 8,
              width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280",
            }}>
              <X size={13} />
            </button>
          )}
        </div>

        {target && (
          <div style={{
            background: "linear-gradient(135deg, #EFF6FF, #F0FDF4)",
            border: "1px solid #BFDBFE",
            borderRadius: 12, padding: "10px 14px",
            fontSize: 13, color: "#1D4ED8", fontWeight: 500,
            marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Zap size={13} />
            Dorks will auto-substitute <strong>"{target}"</strong> where applicable
          </div>
        )}
      </div>

      {/* ── CATEGORY TABS ── */}
      <div style={{ padding: "14px 0 0", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, padding: "0 20px", width: "max-content" }}>
          {CATS.map(c => {
            const active = cat === c.id;
            return (
              <button key={c.id} onClick={() => setCat(c.id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: active ? "#1D4ED8" : "#fff",
                color: active ? "#fff" : "#374151",
                border: active ? "2px solid #1D4ED8" : "2px solid #E5E7EB",
                borderRadius: 40,
                fontSize: 13, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                boxShadow: active ? "0 4px 12px rgba(29,78,216,0.25)" : "none",
              }}>
                <c.Icon size={13} strokeWidth={2.5} />
                {c.label}
                <span style={{
                  background: active ? "rgba(255,255,255,0.25)" : "#F3F4F6",
                  color: active ? "#fff" : "#6B7280",
                  fontSize: 11, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 10,
                }}>
                  {counts[c.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTERS ROW ── */}
      <div style={{ padding: "14px 20px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter dorks..."
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "9px 12px 9px 30px",
              background: "#fff",
              border: "1.5px solid #E5E7EB",
              borderRadius: 12, fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500, outline: "none",
            }}
          />
        </div>
        {/* Severity pills */}
        {["all","critical","high","medium","low"].map(s => (
          <button key={s} onClick={() => setSev(s)} style={{
            padding: "7px 12px",
            background: sev === s ? (s === "all" ? "#111" : SEV[s]?.bg || "#111") : "#fff",
            color: sev === s ? (s === "all" ? "#fff" : SEV[s]?.text || "#fff") : "#6B7280",
            border: sev === s ? `1.5px solid ${s === "all" ? "#111" : SEV[s]?.dot}` : "1.5px solid #E5E7EB",
            borderRadius: 10, fontSize: 12, fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            cursor: "pointer", textTransform: "capitalize",
            transition: "all 0.12s",
          }}>
            {s === "all" ? "All Sev." : s}
          </button>
        ))}
      </div>

      {/* ── RESULTS COUNT ── */}
      <div style={{ padding: "0 20px 10px", fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
        {filtered.length} dork{filtered.length !== 1 ? "s" : ""} found
        {target && ` · target: "${target}"`}
      </div>

      {/* ── DORK CARDS ── */}
      <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(d => {
          const s = SEV[d.sev];
          const isCopied = copied === d.id;
          const resolvedQ = resolve(d.query);
          return (
            <div key={d.id} style={{
              background: "#fff",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #F0F0F3",
              transition: "box-shadow 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{d.label}</span>
                </div>
                <span style={{
                  background: s.bg, color: s.text,
                  fontSize: 10, fontWeight: 800,
                  padding: "3px 8px", borderRadius: 20,
                  letterSpacing: "0.4px",
                  whiteSpace: "nowrap", marginLeft: 8,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                  {s.label.toUpperCase()}
                </span>
              </div>

              {/* Query */}
              <div style={{
                background: "#F8F8FA",
                borderRadius: 10,
                padding: "9px 12px",
                fontSize: 11.5,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                color: "#374151",
                wordBreak: "break-all",
                lineHeight: 1.6,
                marginBottom: 10,
                border: "1px solid #EDEDF0",
              }}>
                {resolvedQ}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => copy(d.query, d.id)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px",
                  background: isCopied ? "#F0FDF4" : "#F8F8FA",
                  color: isCopied ? "#16A34A" : "#374151",
                  border: isCopied ? "1.5px solid #BBF7D0" : "1.5px solid #E5E7EB",
                  borderRadius: 10, fontSize: 12, fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer", transition: "all 0.12s",
                }}>
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button onClick={() => openSearch(d.query)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px",
                  background: "#EFF6FF", color: "#1D4ED8",
                  border: "1.5px solid #BFDBFE",
                  borderRadius: 10, fontSize: 12, fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer", transition: "all 0.12s",
                }}>
                  <ExternalLink size={13} />
                  Google It
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
            <Search size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>No dorks found</p>
            <p style={{ fontSize: 13 }}>Try changing your filters</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: "1px solid #E8E8EC",
        padding: "16px 20px",
        background: "#fff",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.3px" }}>
          Dwork<span style={{ color: "#3B82F6" }}>.</span>
        </span>
        <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>
          Private · For authorized use only
        </span>
      </div>
    </div>
  );
}
