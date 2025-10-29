
---

## Project planning

@analayst *brainstorm
@analayst *create-project-brief
@pm.mdc *create-prd
@ux-expert.mdc *create-front-end-spec @prd.md
@architect.mdc *create-full-stack-architecture @prd.md 

@po.mdc *execute-checklist-po @prd.md
@po.mdc *shard-doc @prd.md


---

## Development loop

@sm.mdc *create-next-story
@dev.mdc *develop-story
@qa.mdc *review 


---

## Git

### Initiate

```

git init
git add .
git commit -m "Initial commit: project documentation and structure"

git remote add origin https://github.com/russell-ruckus/nofi-weather-aura.git
git push -u origin main

```

### New branch

```

git checkout -b <branch name>
git branch
git push -u origin <branch name>

```


