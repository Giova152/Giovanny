import urllib.request
import xml.etree.ElementTree as ET
import sys

def check_sitemap_links(file_path):
    try:
        # On définit le namespace utilisé dans le sitemap
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        # Chargement et parsing du fichier sitemap.xml
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        urls = [loc.text for loc in root.findall('.//ns:loc', namespace)]
        
        print(f"--- Vérification de {len(urls)} URLs dans {file_path} ---")
        
        errors = 0
        for url in urls:
            try:
                # On effectue une requête HEAD pour gagner du temps (vérifie juste l'existence)
                # Ajout d'un User-Agent pour éviter d'être bloqué par certains hébergeurs
                req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'SitemapChecker/1.0'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    status = response.getcode()
                    print(f"[OK] {status} - {url}")
            except urllib.error.HTTPError as e:
                print(f"[ERREUR] {e.code} - {url}")
                errors += 1
            except Exception as e:
                print(f"[ALERTE] Impossible de joindre {url}: {e}")
                errors += 1
        
        if errors == 0:
            print("\n✅ Toutes les URLs sont accessibles !")
            return True
        else:
            print(f"\n❌ Terminé avec {errors} erreur(s).")
            return False
            
    except Exception as e:
        print(f"Erreur lors de la lecture du sitemap : {e}")
        return False

if __name__ == "__main__":
    if not check_sitemap_links('sitemap.xml'):
        sys.exit(1)