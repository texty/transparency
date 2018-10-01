library("tidyr")
library("dplyr")

setwd("/home/yevheniia/git/transparency/data")
file = "original.csv"
file2 = "geocoded.csv"
latlan = read.csv(file2)
data = read.csv(file)
data$X = NULL

gathered = gather(data, "usage", "value", 2:19)
gathered$category <- gsub("\\.", " ", gathered$category)
gathered$value <- gsub("\\,", "\\.", gathered$value)
gathered$value[is.na(gathered$value)] <- 0
gathered$value <- as.numeric(gathered$value)
gathered <- gathered %>% 
  group_by(usage)%>%
  mutate(max = max(value)) %>% 
  ungroup()
gathered$share <- round((gathered$value / (gathered$max/100)), 0)

geocodedData = left_join(gathered, latlan, by = c("NEW.ID.2018"="social_network"))
geocodedData$address <- NULL




write.csv(geocodedData, "geocoded.csv", row.names = F, fileEncoding = 'utf-8')
