from html.parser import HTMLParser
from pathlib import Path
from collections import Counter
import re

root = Path(__file__).resolve().parent.parent / 'dist'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.resources = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if 'id' in data:
            self.ids.append(data['id'])
        if tag in ['script', 'link']:
            url = data.get('src') or data.get('href')
            if url and not url.startswith(('http:', 'https:')):
                self.resources.append(url)

page = Page()
page.feed((root / 'index.html').read_text())
assert not [key for key, count in Counter(page.ids).items() if count > 1], 'Duplicate IDs'
for name in page.resources:
    assert (root / name).is_file(), name
js = '\n'.join(file.read_text() for file in root.glob('*.js'))
refs = set(re.findall(r"getElementById\('([^']+)'\)", js) + re.findall(r"\$\('([^']+)'\)", js))
dynamic = set(re.findall(r"\.id\s*=\s*'([^']+)'", js) + re.findall(r'\bid="([a-z0-9-]+)"', js))
# This corner subtitle is generated from the board tile index.
dynamic.add('corner-sub-20')
assert not refs - set(page.ids) - dynamic, refs - set(page.ids) - dynamic
print(f'HTML: {len(page.ids)} unique IDs, {len(page.resources)} local resources, no broken references')
