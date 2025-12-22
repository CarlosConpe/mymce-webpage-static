import os
import datetime

DOMAIN = "https://www.grupomymce.com"
TODAY = datetime.date.today().isoformat()

# Files to exclude from sitemap
EXCLUDE_FILES = [
    '404.html', 
    'index_clean_preview.html', 
    'test.html', 
    'instagram-test.html',
    'google', # google verification files often look like google<hash>.html
]

def normalize_path(path):
    # Convert file path to URL path
    # .\folder\index.html -> /folder/
    # .\file.html -> /file
    
    # Normalize separators
    path = path.replace('\\', '/')
    
    # Remove leading ./
    if path.startswith('./'):
        path = path[2:]
        
    # Remove filename
    if path.endswith('index.html'):
        return '/' + path[:-10] # remove index.html, keep trailing slash essentially? 
        # Actually standard is usually /folder/ for index.html
        # If path is just index.html -> /
    elif path.endswith('.html'):
        return '/' + path[:-5] # remove .html
        
    return '/' + path

def get_pages():
    pages = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                if 'node_modules' in root: continue
                
                # Check exclusions
                if file in EXCLUDE_FILES: continue
                if file.startswith('google') and file.endswith('.html'): continue
                
                full_path = os.path.join(root, file)
                url_path = normalize_path(full_path)
                
                # Special case for root
                if url_path == '/index.html' or url_path == '//':
                    url_path = '/'
                
                # Clean up double slashes if any
                url_path = url_path.replace('//', '/')
                
                # Importance/Priority logic
                priority = "0.80"
                if url_path == "/":
                    priority = "1.00"
                elif url_path.count('/') > 2:
                    priority = "0.64"
                
                pages.append({
                    'loc': DOMAIN + url_path,
                    'lastmod': TODAY,
                    'priority': priority
                })
    return pages

def generate_xml(pages):
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">')
    
    for p in pages:
        xml.append('  <url>')
        xml.append(f'    <loc>{p["loc"]}</loc>')
        xml.append(f'    <lastmod>{p["lastmod"]}</lastmod>')
        xml.append(f'    <priority>{p["priority"]}</priority>')
        xml.append('  </url>')
        
    xml.append('</urlset>')
    return '\n'.join(xml)

def main():
    pages = get_pages()
    print(f"Found {len(pages)} pages.")
    
    xml_content = generate_xml(pages)
    
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    print("✅ Generated sitemap.xml successfully.")

if __name__ == "__main__":
    main()
