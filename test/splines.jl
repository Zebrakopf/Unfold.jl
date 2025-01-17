using Test, StatsModels
using DataFrames

using Unfold
include("test_utilities.jl")

data,evts = loadtestdata("test_case_3a") #
##

f_spl  = @formula 0~1+conditionA+spl(continuousA,4) # 1
f  = @formula 0~1+conditionA+continuousA # 1
data_r = reshape(data,(1,:))
data_e,times = Unfold.epoch(data=data_r,tbl=evts,τ=(-1.,1.),sfreq=10) # cut the data into epochs

m_mul,m_mul_results = fit(UnfoldLinearModel,f,evts,data_e,times)
m_mul_spl,m_mul_results_spl = fit(UnfoldLinearModel,f_spl,evts,data_e,times)

# asking for 4 splines should generate 4 splines 
@test length(unique(m_mul_results_spl.term)) == 6 # XXX check back with Unfold whether this is the same! could be n-1 splines in Unfold. We should keep that comparable I guess


basisfunction = firbasis(τ=(-1,1),sfreq=10,name="A")
m_tul,m_tul_results = fit(UnfoldLinearModel,f,evts,data_r,basisfunction)
m_tul_spl,m_tul_results_spl = fit(UnfoldLinearModel,f_spl,evts,data_r,basisfunction)

evts_grid = gridexpand() 


# results from timeexpanded and non should be equal
#yhat_tul  = predict(m_tul_spl,evts_grid)
#yhat_mul  = predict(m_mul_spl,evts_grid)
if 1 == 0
using AlgebraOfGraphics
yhat_mul.conditionA = categorical(yhat_mul.conditionA)
yhat_mul.continuousA = categorical(yhat_mul.continuousA)
m = mapping(:times,:yhat,color=:continuousA,linestyle=:conditionA)
df = yhat_mul
AlgebraOfGraphics.data(df) * visual(Lines) * m  |> draw
end

# test much higher number of splines
f_spl_many  = @formula 0~1+spl(continuousA,131) # 1
m_mul_spl_many,m_mul_results_spl_many = fit(UnfoldLinearModel,f_spl_many,evts,data_e,times)
@test length(unique(m_mul_results_spl_many.term)) == 132


