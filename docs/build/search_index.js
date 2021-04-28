var documenterSearchIndex = {"docs":
[{"location":"lmm_tutorial/","page":"-","title":"-","text":"","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"author: \"Benedikt Ehinger with help from Dave Kleinschmidt\" title: \"Overlap Correction with Linear Mixed Models (aka unmixed.jl)\" date: 2020-02-17 –-","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nusing StatsModels, MixedModels, DataFrames\nimport Plots\nusing unfold\ninclude(\"../test/test_utilities.jl\") # to load the simulated data\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"loadtestdata (generic function with 2 methods)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n\nThis notebook is similar to the `lm_tutorial`, but fits mass-univariate *mixed* models and time-expanded/overlap-corrected *mixed* models.\n\n## Reading input\nThe data were simulated in MatLab using the `unmixed toolbox (www.unfoldtoolbox.org)` with the function`EEG_to_csv.m`.\n\n**Limitation**: due to current implementation in MixedModels.jl, we cannot fit overlap-corrected random effects.\nThat is, the `(1|item)` cannot be modelled at the moment.\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"data, evts = loadtestdata(\"testcase3\",\"../test/\") data = data.+ 0.1*randn(size(data)) # we have to add minimal noise, else mixed models crashes.","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"categorical!(evts,:subject);","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n~~~~\n7050×8 DataFrame. Omitted printing of 1 columns\n│ Row  │ type   │ latency │ trialnum │ condA │ condB │ stimulus │ subject │\n│      │ String │ Int64   │ Int64    │ Int64 │ Int64 │ Int64    │ Cat…    │\n├──────┼────────┼─────────┼──────────┼───────┼───────┼──────────┼─────────┤\n│ 1    │ sim    │ 16      │ 1        │ 0     │ 0     │ 4        │ 1       │\n│ 2    │ sim    │ 36      │ 2        │ 1     │ 1     │ 10       │ 1       │\n│ 3    │ sim    │ 51      │ 3        │ 0     │ 1     │ 6        │ 1       │\n│ 4    │ sim    │ 66      │ 4        │ 0     │ 1     │ 8        │ 1       │\n│ 5    │ sim    │ 77      │ 5        │ 1     │ 1     │ 9        │ 1       │\n│ 6    │ sim    │ 91      │ 6        │ 1     │ 0     │ 13       │ 1       │\n│ 7    │ sim    │ 101     │ 7        │ 1     │ 1     │ 13       │ 1       │\n⋮\n│ 7043 │ sim    │ 106425  │ 113      │ 0     │ 0     │ 6        │ 100     │\n│ 7044 │ sim    │ 106439  │ 114      │ 0     │ 1     │ 5        │ 100     │\n│ 7045 │ sim    │ 106455  │ 115      │ 0     │ 0     │ 8        │ 100     │\n│ 7046 │ sim    │ 106471  │ 116      │ 1     │ 1     │ 20       │ 100     │\n│ 7047 │ sim    │ 106491  │ 117      │ 0     │ 0     │ 3        │ 100     │\n│ 7048 │ sim    │ 106507  │ 118      │ 1     │ 0     │ 20       │ 100     │\n│ 7049 │ sim    │ 106518  │ 119      │ 0     │ 1     │ 8        │ 100     │\n│ 7050 │ sim    │ 106534  │ 120      │ 0     │ 1     │ 10       │ 100     │\n~~~~\n\n\n\n\nThe `events` dataFrame looks like this\n~~~~{.julia}\n\nfirst(evts,6)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"6×8 DataFrame. Omitted printing of 1 columns\n│ Row │ type   │ latency │ trialnum │ condA │ condB │ stimulus │ subject │\n│     │ String │ Int64   │ Int64    │ Int64 │ Int64 │ Int64    │ Cat…    │\n├─────┼────────┼─────────┼──────────┼───────┼───────┼──────────┼─────────┤\n│ 1   │ sim    │ 16      │ 1        │ 0     │ 0     │ 4        │ 1       │\n│ 2   │ sim    │ 36      │ 2        │ 1     │ 1     │ 10       │ 1       │\n│ 3   │ sim    │ 51      │ 3        │ 0     │ 1     │ 6        │ 1       │\n│ 4   │ sim    │ 66      │ 4        │ 0     │ 1     │ 8        │ 1       │\n│ 5   │ sim    │ 77      │ 5        │ 1     │ 1     │ 9        │ 1       │\n│ 6   │ sim    │ 91      │ 6        │ 1     │ 0     │ 13       │ 1       │","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"With the important fields being latency, condA, condB and subject.","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"The data are a vector.","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nprintln(typeof(data))\nprintln(size(data))\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Array{Float64,1} (106540,)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n**Limitation** Note how small it is! Only 12k samples, that is only ~5minutes of recording in total for 25 subjects. More realistic samples quickly take hours to fit.\n\n## Without Overlap Correction\nWe define the formula","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"f  = @formula 0~1+condAcondB+(1+condAcondB|subject);","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n~~~~\nFormulaTerm\nResponse:\n  0\nPredictors:\n  1\n  condA(unknown)\n  condB(unknown)\n  (condA,condB,subject)->(1 + condA * condB) | subject\n  condA(unknown) & condB(unknown)\n~~~~\n\n\n\n\n\nepoch the data for the mass-univariate mixed model case\n~~~~{.julia}\n\ndata_r = reshape(data,(1,:))\n# cut the data into epochs\ndata_epochs,times = unfold.epoch(data=data_r,tbl=evts,τ=(-0.4,0.8),sfreq=50);\n# missing or partially missing epochs are currenlty _only_ supported for non-mixed models!\nevts,data_epochs = unfold.dropMissingEpochs(evts,data_epochs)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"(1, 1, 7050)(7046×8 DataFrame. Omitted printing of 1 columns\n│ Row  │ type   │ latency │ trialnum │ condA │ condB │ stimulus │ subject │\n│      │ String │ Int64   │ Int64    │ Int64 │ Int64 │ Int64    │ Cat…    │\n├──────┼────────┼─────────┼──────────┼───────┼───────┼──────────┼─────────┤\n│ 1    │ sim    │ 36      │ 2        │ 1     │ 1     │ 10       │ 1       │\n│ 2    │ sim    │ 51      │ 3        │ 0     │ 1     │ 6        │ 1       │\n│ 3    │ sim    │ 66      │ 4        │ 0     │ 1     │ 8        │ 1       │\n│ 4    │ sim    │ 77      │ 5        │ 1     │ 1     │ 9        │ 1       │\n│ 5    │ sim    │ 91      │ 6        │ 1     │ 0     │ 13       │ 1       │\n│ 6    │ sim    │ 101     │ 7        │ 1     │ 1     │ 13       │ 1       │\n│ 7    │ sim    │ 113     │ 8        │ 0     │ 1     │ 3        │ 1       │\n⋮\n│ 7039 │ sim    │ 106377  │ 110      │ 1     │ 0     │ 13       │ 100     │\n│ 7040 │ sim    │ 106393  │ 111      │ 0     │ 1     │ 6        │ 100     │\n│ 7041 │ sim    │ 106413  │ 112      │ 0     │ 1     │ 8        │ 100     │\n│ 7042 │ sim    │ 106425  │ 113      │ 0     │ 0     │ 6        │ 100     │\n│ 7043 │ sim    │ 106439  │ 114      │ 0     │ 1     │ 5        │ 100     │\n│ 7044 │ sim    │ 106455  │ 115      │ 0     │ 0     │ 8        │ 100     │\n│ 7045 │ sim    │ 106471  │ 116      │ 1     │ 1     │ 20       │ 100     │\n│ 7046 │ sim    │ 106491  │ 117      │ 0     │ 0     │ 3        │ 100     │\n, [-2.1036185545900064 -0.09620616101249467 … 0.03457492319936805 0.1594141\n7693406884]\n\n[-0.010428599490538766 0.11276513561412636 … -0.10155139247255301 13.138691\n65144944]\n\n[0.003689672020482346 -0.11497699754834818 … -0.07875501263475712 -0.102698\n97300242908]\n\n...\n\n[0.17073360929659176 -0.032826413925233666 … -0.11495917097108686 0.0399040\n39006940256]\n\n[-0.02614791264332993 -0.008244069659384892 … 0.11096995533891257 -0.139675\n377005149]\n\n[4.810295203468854 -0.12468795475277622 … -0.16685554419753457 -0.019240882\n427578737])","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"We can now run the LinearMixedModel on each time point","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nm,results = unfold.fit(UnfoldLinearMixedModel,f,evts,data_epochs,times) # just \"fit\" without unfold should also work, but didnt in the Notebook\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"(1, 61, 7046)(7046, 4)(1, 61, 4)(Unfold object formula: 0 ~ 1 + condA + condB + condA & condB + (1 + condA + condB + condA  & condB | subject) Fields:\t.modelinfo (potentially contains info on fitting procedure)  \t.beta extracted parameters  \t.X designmatrix (with fields .X.Xs, .X.events .X.formulas , 488×7 DataFrame. Omitted printing of 2 columns │ Row │ term          │ channel │ basisname       │ colname_basis │ estimat e  │ │     │ Any           │ Int64   │ String          │ Float64       │ Float64    │ ├─────┼───────────────┼─────────┼─────────────────┼───────────────┼──────── ───┤ │ 1   │ (Intercept)   │ 1       │ mass-univariate │ -0.4          │ 0.55582    │ │ 2   │ (Intercept)   │ 1       │ mass-univariate │ -0.38         │ 0.90467 1  │ │ 3   │ (Intercept)   │ 1       │ mass-univariate │ -0.36         │ 1.31158    │ │ 4   │ (Intercept)   │ 1       │ mass-univariate │ -0.34         │ 0.94732    │ │ 5   │ (Intercept)   │ 1       │ mass-univariate │ -0.32         │ 1.07633    │ │ 6   │ (Intercept)   │ 1       │ mass-univariate │ -0.3          │ 1.1854     │ │ 7   │ (Intercept)   │ 1       │ mass-univariate │ -0.28         │ 1.28006    │ ⋮ │ 481 │ condA & condB │ 1       │ mass-univariate │ 0.66          │ 1.36589    │ │ 482 │ condA & condB │ 1       │ mass-univariate │ 0.68          │ 1.74169    │ │ 483 │ condA & condB │ 1       │ mass-univariate │ 0.7           │ 0.68496 9  │ │ 484 │ condA & condB │ 1       │ mass-univariate │ 0.72          │ 0.48884 3  │ │ 485 │ condA & condB │ 1       │ mass-univariate │ 0.74          │ 0.01856 26 │ │ 486 │ condA & condB │ 1       │ mass-univariate │ 0.76          │ 0.60035 6  │ │ 487 │ condA & condB │ 1       │ mass-univariate │ 0.78          │ 0.19045 5  │ │ 488 │ condA & condB │ 1       │ mass-univariate │ 0.8           │ 0.85210 1  │)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n\n### Fixed Effects","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"resfixef = results[results.group.==\"fixed\",:] Plots.plot(resfixef.colnamebasis,resfixef.estimate,         group=res_fixef.term,         layout=1,legend=:outerbottom)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n~~~~\nError: MethodError: no method matching union()\nClosest candidates are:\n  union(!Matched::DataStructures.IntSet, !Matched::Any) at C:\\Users\\behinge\nr\\.julia\\packages\\DataStructures\\DLSxi\\src\\int_set.jl:96\n  union(!Matched::DataStructures.SparseIntSet, !Matched::Any) at C:\\Users\\b\nehinger\\.julia\\packages\\DataStructures\\DLSxi\\src\\sparse_int_set.jl:151\n  union(!Matched::BitSet, !Matched::Any...) at bitset.jl:312\n  ...\n~~~~\n\n\n\n\nWe see the condition effects and some residual overlap activity in the fixed effects\n\n### Random Effects\nAnd the random effect results\n~~~~{.julia}\n\nres_ranef = results[results.group.==\"subject\",:]\nPlots.plot(res_ranef.colname_basis,res_ranef.estimate,\n        group=res_ranef.term,\n        layout=1,legend=:outerbottom)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: MethodError: no method matching union()\nClosest candidates are:\n  union(!Matched::DataStructures.IntSet, !Matched::Any) at C:\\Users\\behinge\nr\\.julia\\packages\\DataStructures\\DLSxi\\src\\int_set.jl:96\n  union(!Matched::DataStructures.SparseIntSet, !Matched::Any) at C:\\Users\\b\nehinger\\.julia\\packages\\DataStructures\\DLSxi\\src\\sparse_int_set.jl:151\n  union(!Matched::BitSet, !Matched::Any...) at bitset.jl:312\n  ...","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"The random effects are very high in areas where we simulated overlap. (i.e. <-0.1 and >0.2)","category":"page"},{"location":"lmm_tutorial/#With-Overlap-Correction","page":"-","title":"With Overlap Correction","text":"","category":"section"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"For overlap correction, we have to use a basis function once again.","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nbasisfunction = firbasis(τ=(-0.05,.4),sfreq=40)\nf  = @formula 0~1+condA*condB+(1+condA*condB|subject);\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: UndefKeywordError: keyword argument name not assigned","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n\n**Limitation:** Currently we cannot model correlation between time-points or random slopes.\n\n**Limitation:** See the low sampling frequency? This is because the modelfit increases quadratically with the number of predictors\n\nWe can now run the mixed model.\n\nEasy syntax: Specify formula, events, EEG-data & the basis function","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"@time mm,results = unfold.fit(UnfoldLinearMixedModel,f,evts,data,basisfunction) # just \"fit\" without unfold should also work, but didnt in the Notebook","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n~~~~\nError: UndefVarError: basisfunction not defined\n~~~~\n\n\n\n\nWe receive an object containing the (very large) mixed model:\n~~~~{.julia}\n\nshow(coeftable(mm.modelinfo))","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: UndefVarError: mm not defined","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"But again, we also get a tidy-dataframe with the results","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nfirst(results,6)\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"6×7 DataFrame. Omitted printing of 2 columns │ Row │ term        │ channel │ basisname       │ colname_basis │ estimate  │ │     │ Any         │ Int64   │ String          │ Float64       │ Float64   │ ├─────┼─────────────┼─────────┼─────────────────┼───────────────┼────────── ┤ │ 1   │ (Intercept) │ 1       │ mass-univariate │ -0.4          │ 0.55582   │ │ 2   │ (Intercept) │ 1       │ mass-univariate │ -0.38         │ 0.904671  │ │ 3   │ (Intercept) │ 1       │ mass-univariate │ -0.36         │ 1.31158   │ │ 4   │ (Intercept) │ 1       │ mass-univariate │ -0.34         │ 0.94732   │ │ 5   │ (Intercept) │ 1       │ mass-univariate │ -0.32         │ 1.07633   │ │ 6   │ (Intercept) │ 1       │ mass-univariate │ -0.3          │ 1.1854    │","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n\nand thus we can easily plot the fixed effect results.","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"resfixef = results[results.group.==\"fixed\",:] Plots.plot(resfixef.colnamebasis,resfixef.estimate,         group=res_fixef.term,         layout=1,legend=:outerbottom)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n~~~~\nError: MethodError: no method matching union()\nClosest candidates are:\n  union(!Matched::DataStructures.IntSet, !Matched::Any) at C:\\Users\\behinge\nr\\.julia\\packages\\DataStructures\\DLSxi\\src\\int_set.jl:96\n  union(!Matched::DataStructures.SparseIntSet, !Matched::Any) at C:\\Users\\b\nehinger\\.julia\\packages\\DataStructures\\DLSxi\\src\\sparse_int_set.jl:151\n  union(!Matched::BitSet, !Matched::Any...) at bitset.jl:312\n  ...\n~~~~\n\n\n\n\n\nAnd the random effect results.\n~~~~{.julia}\n\nres_ranef = results[results.group.==\"subject\",:]\nPlots.plot(res_ranef.colname_basis,res_ranef.estimate,\n        group=res_ranef.term,\n        layout=1,legend=:outerbottom)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: MethodError: no method matching union()\nClosest candidates are:\n  union(!Matched::DataStructures.IntSet, !Matched::Any) at C:\\Users\\behinge\nr\\.julia\\packages\\DataStructures\\DLSxi\\src\\int_set.jl:96\n  union(!Matched::DataStructures.SparseIntSet, !Matched::Any) at C:\\Users\\b\nehinger\\.julia\\packages\\DataStructures\\DLSxi\\src\\sparse_int_set.jl:151\n  union(!Matched::BitSet, !Matched::Any...) at bitset.jl:312\n  ...","category":"page"},{"location":"lmm_tutorial/#What-is-happening-under-the-hood?","page":"-","title":"What is happening under the hood?","text":"","category":"section"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nXdc = designmatrix(UnfoldLinearMixedModel,f,evts,basisfunction)\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: UndefVarError: basisfunction not defined","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n\nFormula-Terms are wrapped with a `TimeExpandedTerm`, which upon calling `modelcols` will timeexpand the designmatrix.\nThere is one TimeExpandedTerm for the FixedEffects and one for each RandomEffectsTerm.\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"typeof(Xdc.formulas.rhs)","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n~~~~\nError: UndefVarError: Xdc not defined\n~~~~\n\n\n\n\n\nVisualizing the designmatrices.\nFixed Effects:\n~~~~{.julia}\n\nPlots.heatmap(Matrix(Xdc.Xs[1][1:300,:]))","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: UndefVarError: Xdc not defined","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Random Effects","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\nPlots.heatmap(Matrix(Xdc.Xs[2][1:2000,1:500]))\n~~~~~~~~~~~~~\n\n","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Error: UndefVarError: Xdc not defined","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"\n\n\n\n\n\nAnd finally, generate the linear mixed model manually & fit it.","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"{.julia}","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"mf = unfoldfit(unfold.UnfoldLinearMixedModel,Xs,data) results = condense_long(mf) first(results,6) ~~~~~~~~~~~~~","category":"page"},{"location":"lmm_tutorial/#Summary","page":"-","title":"Summary","text":"","category":"section"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"There are four different model types currently \"fitable\"","category":"page"},{"location":"lmm_tutorial/","page":"-","title":"-","text":"Timeexpansion No, Mixed No  : fit(UnfoldLinearModel,f,evts,data_epoch,times)\nTimeexpansion Yes, Mixed No : fit(UnfoldLinearModel,f,evts,data,basisfunction)\nTimeexpansion No, Mixed Yes : fit(UnfoldLinearMixedModel,f,evts,data_epoch,times)\nTimeexpansion Yes, Mixed Yes: fit(UnfoldLinearMixedModel,f,evts,data,basisfunction)","category":"page"},{"location":"#Unfold-Documentation","page":"Unfold Documentation","title":"Unfold Documentation","text":"","category":"section"},{"location":"","page":"Unfold Documentation","title":"Unfold Documentation","text":"","category":"page"},{"location":"#Testing","page":"Unfold Documentation","title":"Testing","text":"","category":"section"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"author: \"Benedikt Ehinger, with help Dave Kleinschmidt\" title: \"Overlap Correction with Linear Models (aka unfold.jl)\" date: 2021-04-28 –-","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"First we have to install some packages. in julia you would do this either by putting a \"]\" in the REPL (\"julia-commandline\"). This should result in (unfold) pkg> - but if you see (@v1.6) pkg>  instead, you still have to activate your environment (using cd(\"/path/to/your/project\") and ]activate . or ]activate /path/to/your/project/)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Note that you should have done this already to install unfold in the first place. have a look at the Readme.md - there we use the Pkg.add(\"\") syntax, which is equivalent to the ] package manager. Now we are ready to add packages: add StatsModels,MixedModels,DataFrames,DSP.conv,Plots","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Next we have to make sure to be in the unfold/docs folder, else the tutorial will not be able to find the data. Thus cd(\"./docs\") in case you cd'ed already to the unfold project.","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\nusing StatsModels, MixedModels, DataFrames\nimport DSP.conv\nimport Plots\nusing unfold\ninclude(\"../../test/test_utilities.jl\"); # to load the simulated data","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"In this notebook we will fit regression models to (simulated) EEG data. We will see that we need some type of overlap correction, as the events are close in time to each other, so that the respective brain responses overlap. If you want more detailed introduction to this topic check out my paper: https://peerj.com/articles/7838/","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nprintln(pwd())\ndata, evts = loadtestdata(\"testCase2\",dataPath=\"../../test/data/\");","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"show(first(evts,6,),allcols=true)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"The data has little noise and the underlying signal is a pos-neg spike pattern","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nPlots.plot(range(1/50,length=300,step=1/50),data[1:300])\nPlots.vline!(evts[evts.latency.<=300,:latency]./50) # show events","category":"page"},{"location":"lm_tutorial/#Traditional-Mass-Univariate-Analysis","page":"LM Tutorial","title":"Traditional Mass Univariate Analysis","text":"","category":"section"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"In order to demonstrate why overlap correction is important, we will first epoch the data and fit a linear model to each time point. This is a \"traditional mass-univariate analysis\".","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\n# we have multi channel support\ndata_r = reshape(data,(1,:))\n# cut the data into epochs\ndata_epochs,times = unfold.epoch(data=data_r,tbl=evts,τ=(-0.4,0.8),sfreq=50)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"We define a formula that we want to apply to each point in time","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"f  = @formula 0~1+conditionA+conditionB # 0 as a dummy, we will combine wit data later","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"We fit the UnfoldLinearModel to the data","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"m,results = unfold.fit(UnfoldLinearModel,f,evts,data_epochs,times)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"The object has the following fields","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nprintln(typeof(m))\nm","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Which contain the model, the original formula, the original events and returns extra a tidy-dataframe with the results","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nfirst(results,6)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"We can also plot it:","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nPlots.plot(results.colname_basis,results.estimate,\n        group=results.term,\n        layout=1,legend=:outerbottom)\n# equivalent: plot(m)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"(:colname_basis is used instead of :time, this might change. But the reason is that not all basisfunctions have a time dimension) As can be seen a lot is going on here. As we will see later, most of the activity is due to overlap with the next event","category":"page"},{"location":"lm_tutorial/#Basis-Functions","page":"LM Tutorial","title":"Basis Functions","text":"","category":"section"},{"location":"lm_tutorial/#HRF-/-BOLD","page":"LM Tutorial","title":"HRF / BOLD","text":"","category":"section"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"We are now ready to define a basisfunction. There are currently only two basisfunction implemented, so not much choice. We first have a look at the BOLD-HRF basisfunction:","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nTR = 1.5\nbold = hrfbasis(TR) # using default SPM parameters\neventonset = 1.3\nPlots.plot(bold.kernel(eventonset))","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Classically, we would convolve this HRF function with a impulse-vector, with impulse at the event onsets","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\ny = zeros(100)\ny[[10,30,37,45]] .=1\ny_conv = conv(y,bold.kernel(0))\nPlots.plot(y_conv)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Which one would use as a regressor against the recorded BOLD timecourse.","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Note that events could fall inbetween TR (the sampling rate). Some packages subsample the time signal, but in unfold we can directly call the bold.kernel function at a given event-time, which allows for non-TR-multiples to be used.","category":"page"},{"location":"lm_tutorial/#FIR-Basis-Function","page":"LM Tutorial","title":"FIR Basis Function","text":"","category":"section"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Okay, let's have a look at a different basis function: The FIR basisfunction.","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nbasisfunction = firbasis(τ=(-0.4,.8),sfreq=50,name=\"myFIRbasis\")\nPlots.plot(basisfunction.kernel(0))","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Not very clear, better show it in 2D","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nbasisfunction.kernel(0)[1:10,1:10]","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"The FIR basisset consists of multiple basisfunctions. That is, each event will now be timeexpanded to multiple predictors, each with a certain time-delay to the event onset. This allows to model any arbitrary linear overlap shape, and doesn't force us to make assumptions on the convolution kernel (like we had to do in the BOLD case)","category":"page"},{"location":"lm_tutorial/#Timeexpanded-/-Deconvolved-ModelFit","page":"LM Tutorial","title":"Timeexpanded / Deconvolved ModelFit","text":"","category":"section"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Remember our formula from above","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nf","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"For the left-handside we use \"0\" as the data is separated from the events. This will in the future allow us to fit multiple channels easily.","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"And fit a UnfoldLinearModel. Not that instead of times as in the mass-univariate case, we have a BasisFunction object now.","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nm,results = unfold.fit(UnfoldLinearModel,f,evts,data,basisfunction)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"\n\nPlots.plot(results.colname_basis,results.estimate,\n        group=results.term,\n        layout=1,legend=:outerbottom)","category":"page"},{"location":"lm_tutorial/","page":"LM Tutorial","title":"LM Tutorial","text":"Cool! All overlapping activity has been removed and we recovered the simulated underlying signal.","category":"page"}]
}
