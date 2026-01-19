const fs = require('fs');

try {
    const data = fs.readFileSync('report.json', 'utf8');
    const report = JSON.parse(data);

    const broken = report.links.filter(l => l.status !== 200);

    const byStatus = {};
    broken.forEach(l => {
        byStatus[l.status] = byStatus[l.status] || [];
        byStatus[l.status].push(l);
    });

    console.log(`Total Links Scanned: ${report.links.length}`);
    console.log(`Total Broken Links: ${broken.length}`);

    for (const status in byStatus) {
        console.log(`\n=== Status ${status} (${byStatus[status].length} links) ===`);

        if (status === '404') {
            const counts = {};
            byStatus[status].forEach(l => {
                const url = l.url;
                const parent = l.parent;
                if (!counts[url]) counts[url] = { count: 0, parents: new Set() };
                counts[url].count++;
                counts[url].parents.add(parent);
            });

            const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);

            console.log(`Top 50 404 Errors:`);
            sorted.slice(0, 50).forEach(([url, data]) => {
                console.log(`  ${url}`);
                console.log(`    -> Referenced in ${data.parents.size} files`);
                if (data.parents.size < 5) {
                    // Show example parents
                    console.log(`    -> Examples: ${Array.from(data.parents).slice(0, 3).join(', ')}`);
                }
            });
        } else if (status === '0') {
            console.log(`  (Likely blocked external links or timeouts)`);
            const domains = {};
            byStatus[status].forEach(l => {
                try {
                    const hostname = new URL(l.url).hostname;
                    domains[hostname] = (domains[hostname] || 0) + 1;
                } catch (e) {
                    // ignore invalid urls
                }
            });
            const sortedDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]);
            sortedDomains.slice(0, 10).forEach(([d, c]) => console.log(`  ${d}: ${c} links`));
        } else {
            byStatus[status].slice(0, 10).forEach(l => console.log(`  ${l.url} (from ${l.parent})`));
        }
    }

} catch (e) {
    console.error("Failed to parse report.json:", e.message);
}
