import pandas as pd
import math
import sys
import numpy as np
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity

#Recuperation des datas
DEFAULT_PATH = "./input/"
NBR_MUSIQUE_TRAITEMENT = 100
musiques = pd.read_csv(DEFAULT_PATH + "musiquecompile/dataCompile.csv")

#Trie filtrages des données
df = musiques.drop(musiques.columns[:5], axis=1)
df.drop(df.columns[11:16], axis=1, inplace=True)
df.drop(["time_signature"], axis=1, inplace=True)

#Normalise data
normalized_df=(df-df.mean())/df.std()
all_normalized_df = normalized_df[:NBR_MUSIQUE_TRAITEMENT]

#calcule similariter
matrice = all_normalized_df.to_numpy()
similariter = cosine_similarity(matrice)#regarder pour euclide
value = np.round(similariter, 4)
similariter[similariter <= 0.5] = 0

#Generate graph
g = nx.from_numpy_matrix(similariter)
g = nx.relabel_nodes(g,{i:musiques["song_name"][i]+'\\'+musiques["artiste_name"][i] for i in range(len(normalized_df))})

#Triage des voisin pour prendre celui qui a le plu fort weight
def getMusiqueSimilar(musiqueTitle):
    #Init
    titleMusique = []
    weight = []
    #Recuperation et création des listes
    for i in g.adj[musiqueTitle].items():
        titleMusique.append(i[0])
        weight.append(i[1]['weight'])

    #Creation de DataFrame
    #Creation d'un DataFrame pour pouvoir tier par leurs poids
    data = {"title": titleMusique, "weight": weight}
    sameMusique = pd.DataFrame(data=data)
    sameMusique.set_index("title", inplace=True)
    sameMusique.sort_values("weight", inplace=True, ascending=False)
    return sameMusique


#Triage des voisin pour prendre celui qui a le plu fort weight
def getMusiqueMostSimilar(listMusique):
    #Init
    listMusiqueStockage = []
    musiqueData = {}
    
    #Recuperation et création des listes
    for musiqueTitle in listMusique:
        for i in g.adj[musiqueTitle].items():
            musiqueData[i[0]] = i[1]['weight']
        listMusiqueStockage.append(musiqueData)
        musiqueData = {}

    resultIntersectionSet = set([i[0] for i in list(listMusiqueStockage[0].items())])
    for page in listMusiqueStockage:
        resultIntersectionSet = resultIntersectionSet & set([i[0] for i in list(page.items())])#Recupération des nom des musiques
    
    nameMusique_Weight = {}
    for nameMusique in resultIntersectionSet:
        for listMusiqueIndex in listMusiqueStockage:
            if nameMusique in listMusiqueIndex:
                if nameMusique in nameMusique_Weight:
                    nameMusique_Weight[nameMusique] = (listMusiqueIndex[nameMusique] + nameMusique_Weight[nameMusique]) / 2
                else:
                    nameMusique_Weight[nameMusique] = listMusiqueIndex[nameMusique]
            
    data = {"title": [i for i in nameMusique_Weight.keys()], "weight": [i for i in nameMusique_Weight.values()]}
    return pd.DataFrame(data=data).set_index("title").sort_values("weight", ascending=False)#list(resultIntersectionDic)



def getGraphForMusique(title):
    listAllNode = list(g.adj[title])[:100]
    sameMusique = getMusiqueSimilar(title)

    graphMusiqueChoose = nx.Graph()
    graphMusiqueChoose.add_nodes_from(listAllNode)
    for i in listAllNode:
        graphMusiqueChoose.add_edge(title, i, weight=math.exp(sameMusique.loc[i]*4)/10)
    
    weights = [graphMusiqueChoose[u][v]['weight'] for u,v in graphMusiqueChoose.edges()]
    plt.figure(1,figsize=(30,20)) 
    nx.draw_networkx(graphMusiqueChoose, width=[float(i) for i in weights])

musiquesIdSongName = musiques.set_index("song_name")

def getMusiqueData(listAllMusiqueName):
    allDataMusique = []
    for i in listAllMusiqueName.index:
        musiqueInfoReachTab = i.split("\\")
        data = musiquesIdSongName.loc[musiqueInfoReachTab[0]]
        if (len(data.shape) > 1):
            for j in range(data.shape[0]):
                if musiqueInfoReachTab[1] == data["artiste_name"].iloc[j]:
                    allDataMusique.append(data.iloc[j])
        else:
            allDataMusique.append(data)
    return allDataMusique

def makeDataReturn(listMusique):
    urlMusique = []
    for i in listMusique:
        urlMusique.append(i["track_href"])
    # print(urlMusique)
    data = {"title": [i for i in urlMusique]}
    return pd.DataFrame(data=data)


allMusique = sys.argv[1:]

print(allMusique)
print(makeDataReturn(getMusiqueData(getMusiqueMostSimilar(allMusique))).to_json(orient="records"))
