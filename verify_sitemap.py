import os
import re

def normalize_path(path):
    # Convert file path to URL-like path
    # e.g. ./portafolio/index.html -> /portafolio
    path = path.replace('\\', '/')
    if path.startswith('./'):
        path = path[2:]
    
    if path.endswith('index.html'):
        return '/' + path[:-10] # remove index.html
    elif path.endswith('.html'):
        return '/' + path[:-5] # remove .html
    return '/' + path

def get_actual_pages():
    pages = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                if 'node_modules' in root: continue
                if file in ['index_clean_preview.html', 'test.html', '404.html']: continue
                
                full_path = os.path.join(root, file)
                pages.append(normalize_path(full_path))
    return set(pages)

def get_sitemap_urls():
    try:
        with open('sitemap.xml', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract <loc>...</loc>
        # Assuming format <loc>https://www.grupomymce.com/path/</loc>
        urls = re.findall(r'<loc>(.*?)</loc>', content)
        
        normalized_urls = []
        domain = 'https://www.grupomymce.com' # Or whatever domain is used
        
        for u in urls:
            if u.startswith(domain):
                u = u[len(domain):]
            
            # Normalize trailing slash
            if u.endswith('/') and len(u) > 1:
                # Our file walker might produce /path/ or /path
                pass
            normalized_urls.append(u)
            
        return set(normalized_urls)
    except Exception as e:
        print(f"Error reading sitemap: {e}")
        return set()

def main():
    actual = get_actual_pages()
    sitemap = get_sitemap_urls()
    
    # Normalize for comparison (ensure trailing slash consistency)
    # Let's strip trailing slashes for comparison
    actual_stripped = {u.rstrip('/') for u in actual}
    sitemap_stripped = {u.rstrip('/') for u in sitemap}
    
    print(f"Actual Pages Found: {len(actual_stripped)}")
    print(f"Sitemap URLs Found: {len(sitemap_stripped)}")
    
    missing_in_sitemap = actual_stripped - sitemap_stripped
    extra_in_sitemap = sitemap_stripped - actual_stripped
    
    if missing_in_sitemap:
        print("\n❌ MISSING in Sitemap (Files exist but not in XML):")
        for p in sorted(missing_in_sitemap):
            print(f" - {p}")
            
    if extra_in_sitemap:
        print("\n⚠️ EXTRA in Sitemap (In XML but file not found?):")
        for p in sorted(extra_in_sitemap):
            print(f" - {p}")
            
    if not missing_in_sitemap and not extra_in_sitemap:
        print("\n✅ Sitemap is perfectly synced with file structure!")

if __name__ == "__main__":
    main()
