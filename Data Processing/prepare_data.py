import pandas as pd
import json
from pandas import ExcelWriter
from pandas import ExcelFile

xls = pd.ExcelFile('user_data.xls')

def create_entity_list(list_name):
    df = pd.read_excel(xls,sheet_name='EntityList')
    data = {"name": list_name,"subLists":[]}  
    for _, row in df.iterrows():
        if len(str(row['UserId']))>3:
            data["subLists"].append({
                    'canonicalForm': row['UserId'],
                    'list': [row['FullName'],row['UserName'],row['Name']]
                })
    with open('EmployeeName.json', 'w') as outfile:  
        json.dump(data, outfile,indent=4)

def create_utterances_list():
    df = pd.read_excel(xls, sheet_name='Utterances')
    data = {"utterances":[]}  
    for _, row in df.iterrows():
        if len(str(row['utterances']))>3:
            print("len(str(row['utterances'])): "+str(len(str(row['utterances']))))
            data["utterances"].append({
                    'text': row['utterances'],
                    'intent': row['intent'],
                    "entities":[]
                })
    with open('Utterances.json', 'w') as outfile:  
            json.dump(data, outfile,indent=4)
def create_pattern_list():
    df = pd.read_excel(xls, sheet_name='Patterns')
    data = {"patterns":[]}  
    for _, row in df.iterrows():
        if len(str(row['pattern']))>3:
            data["patterns"].append({
                    'pattern': row['pattern'],
                    'intent': row['intent'],
                })
    with open('Patterns.json', 'w') as outfile:  
            json.dump(data, outfile,indent=4)

def main():
    create_entity_list("EmployeeName")
    create_utterances_list()
    create_pattern_list()

if __name__ == "__main__":
    main()