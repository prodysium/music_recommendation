import pandas as pd
import sys
import time
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

class Musique:
    musiqueData = []

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id="f6beea06f8124589a06117823be188ec",
                                                           client_secret="88e75d4a47ff46838be883d96169c454"))
allColumns = ["track_id", "song_id", "artiste_name", "song_name","danceability", "energy", "key", "loudness", "mode", "speechiness", "acousticness",
              "instrumentalness", "liveness", "valence", "tempo", "type", "id", "uri", "track_href", "analysis_url",
              "duration_ms", "time_signature"]
df = pd.read_csv("./out/finalSortieData.csv")

track_id = df["track_id"]
song_id = df["song_id"]
artistes_name = df["artiste_name"]
songs_name = df["song_name"]

musique = Musique()
def exportData():
    print("Export")
    lastDfData = pd.read_csv("./out/dataSpotify_tmp.csv")
    newExportData = pd.DataFrame(musique.musiqueData, columns=allColumns)
    finalExport = pd.concat([lastDfData, newExportData])
    finalExport.drop(finalExport.columns[0], axis=1, inplace=True)
    finalExport.to_csv("./out/dataSpotify_tmp.csv")
    musique.musiqueData = []


for i in range(len(songs_name)):
    try:
        if i % 30 == 0 and i != 0:
            print(musique.musiqueData)
            exportData()

        results = sp.search(q=songs_name[i] + ' artist:' + artistes_name[i], limit=1)
        for idx, track in enumerate(results['tracks']['items']):
            print(i, track['id'])
            features = sp.audio_features(track['id'])
            for feature in features:
                newList = [track_id[i], song_id[i], artistes_name[i], songs_name[i]]
                for f in feature:
                    newList.append(feature[f])
                musique.musiqueData.append(newList)
        time.sleep(0.9)
    except:
        print(sys.exc_info()[0])
        exportData()
        sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id="f6beea06f8124589a06117823be188ec",
                                                                   client_secret="88e75d4a47ff46838be883d96169c454"))
