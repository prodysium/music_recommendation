from classe.ContenueSimilar import ContenueSimilar
import pickle
import os



from classe.ContenueSimilar import ContenueSimilar

recommandation = ContenueSimilar()

if (os.path.isfile("recommandationPreprocessing.p")):
    file = open("recommandationPreprocessing.p",'rb')
    recommandation = pickle.load(file)
    file.close()
else :
    recommandation.preprocessingByStyleMusique()
    data = pickle.dumps(recommandation)
    f = open("recommandationPreprocessing.p", "wb")
    f.write(data)
    f.close()

print("lancement Python")
while True:
    lineRead = input()
    data = lineRead.split(':')
    commande = data[0]
    args = data[1]
    tupleDataLine = (commande, args)
    if tupleDataLine[0] == "getMusiqueSimilar":
        recommandation.getGraphForMusique(args)
        print(recommandation.getMusiqueSimilar(args))#Id musique #getMusiqueSimilar:id
    elif tupleDataLine[0] == "getGraphAllMusique":
        recommandation.getGraphAllMusique()