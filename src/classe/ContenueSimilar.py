import pandas as pd
import math
import matplotlib.pyplot as plt
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity

from classe.Recommandation import Recommandation

class ContenueSimilar(Recommandation):

    def __init__(self):
        super().__init__()

        # List des variables disponible
        self.df = None
        self.normalized_df = None
        self.normalized_df_and_limited = None
        self.similariter = None
        self.g = None
        self.preprocessing()

    """
        Permet de préparer les données
        Permet la création de la génération de candidats
    """
    def preprocessing(self):
        self.df = self.data.drop(self.data.columns[:5], axis=1)
        self.df.drop(self.df.columns[11:16], axis=1, inplace=True)
        self.df.drop(["time_signature"], axis=1, inplace=True)

        self.normalized_df = (self.df - self.df.mean()) / self.df.std()
        self.normalized_df_and_limited = self.normalized_df[:1000]
        matrice = self.normalized_df_and_limited.to_numpy()

        self.similariter = cosine_similarity(matrice)
        self.similariter[self.similariter <= 0.5] = 0

        self.g = nx.from_numpy_matrix(self.similariter)
        self.g = nx.relabel_nodes(self.g, {i: self.data["id"][i] for i in range(len(self.normalized_df))})
        self.isPreprocessed = True

    """
        Vas noter les musiques avec un contenue similaire
    """
    def getMusiqueSimilar(self, musiqueId):
        # Init
        idSongMusiqueData = []
        weight = []
        # Recuperation et création des listes
        for i in self.g.adj[musiqueId].items():
            idSongMusiqueData.append(i[0])
            weight.append(i[1]['weight'])

        # Creation de DataFrame
        # Creation d'un DataFrame pour pouvoir tier par leurs poids
        data = {"id": idSongMusiqueData, "weight": weight}
        sameMusique = pd.DataFrame(data=data)
        sameMusique.set_index("id", inplace=True)
        sameMusique.sort_values("weight", inplace=True, ascending=False)
        return sameMusique

    def normaliseExportData(self, dataFrame: pd.DataFrame, columnsNeed=None):
        if columnsNeed is None:
            columnsNeed = ["id", "weight"]

        dataFrame["id"] = dataFrame.index
        dataFrame.reset_index(drop=True, inplace=True)
        if list(dataFrame.columns) in columnsNeed:
            return "ERROR COLUMNS"

        dataNormalize = self.data[self.data["id"].isin(list(dataFrame["id"]))].drop("Unnamed: 0", axis=1)
        dataNormalize.set_index("id", drop=False, inplace=True)
        weight = []
        for i in range(dataFrame.shape[0]):
            weight.append(list(dataNormalize.loc[dataFrame.loc[i]["id"]]))
            weight[i].append(dataFrame.loc[i]["weight"])
        columns = list(dataNormalize.columns)
        columns.append("weight")
        dataNormalize = pd.DataFrame(weight, columns=columns)
        return dataNormalize

    """
        Vas noter les musiques avec un contenue similaire
    """
    def getMusiqueMostSimilar(self, listMusique):
        # Init
        listMusiqueStockage = []
        musiqueData = {}

        # Recuperation et création des listes
        for musiqueTitle in listMusique:
            for i in self.g.adj[musiqueTitle].items():
                musiqueData[i[0]] = i[1]['weight']
            listMusiqueStockage.append(musiqueData)
            musiqueData = {}

        resultIntersectionSet = set([i[0] for i in list(listMusiqueStockage[0].items())])
        for page in listMusiqueStockage:
            resultIntersectionSet = resultIntersectionSet & set(
                [i[0] for i in list(page.items())])  # Recupération des nom des musiques

        nameMusique_Weight = {}
        for nameMusique in resultIntersectionSet:
            for listMusiqueIndex in listMusiqueStockage:
                if nameMusique in listMusiqueIndex:
                    if nameMusique in nameMusique_Weight:
                        nameMusique_Weight[nameMusique] = (listMusiqueIndex[nameMusique] + nameMusique_Weight[
                            nameMusique]) / 2
                    else:
                        nameMusique_Weight[nameMusique] = listMusiqueIndex[nameMusique]

        data = {"title": [i for i in nameMusique_Weight.keys()], "weight": [i for i in nameMusique_Weight.values()]}
        return pd.DataFrame(data=data).set_index("title").sort_values("weight", ascending=False)

    """
        Genere un graphique avec les plus proche
    """
    def getGraphForMusique(self, title):
        listAllNode = list(self.g.adj[title])[:100]
        sameMusique = self.getMusiqueSimilar(title)

        graphMusiqueChoose = nx.Graph()
        graphMusiqueChoose.add_nodes_from(listAllNode)
        for i in listAllNode:
            graphMusiqueChoose.add_edge(title, i, weight=math.exp(sameMusique.loc[i] * 4) / 10)

        weights = [graphMusiqueChoose[u][v]['weight'] for u, v in graphMusiqueChoose.edges()]
        plt.figure(1, figsize=(30, 20))
        nx.draw_networkx(graphMusiqueChoose, width=[float(i) for i in weights])